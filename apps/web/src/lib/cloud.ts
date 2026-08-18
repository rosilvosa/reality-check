import {
  doc, getDoc, setDoc, deleteDoc,
  collection, addDoc, getDocs, query, orderBy, Timestamp,
} from 'firebase/firestore'
import { db } from './db'
import type { Settings, StreakData } from '../types'
import { deletePostsByUser } from './community'
import { localStorageAdapter, mergeStreak, type StorageAdapter } from './storage'

// Split out of storage.ts so the Firestore SDK is not in the eager import
// graph. storage.ts reaches this with a dynamic import, which also breaks what
// would otherwise be a static cycle between the two files.

export function firestoreAdapter(uid: string): StorageAdapter {
  return {
    async getSettings() {
      const snap = await getDoc(doc(db, 'users', uid, 'data', 'settings'))
      if (!snap.exists()) return null
      const d = snap.data()
      return {
        monthlyPay: d.monthlyPay ?? 0,
        hoursPerMonth: d.hoursPerMonth ?? 176,
        assets: d.assets ?? [],
        voidType: d.voidType ?? null,
        currency: d.currency ?? 'PHP',
        helpRegion: d.helpRegion ?? 'PH',
        updatedAt: d.updatedAt,
      }
    },

    async saveSettings(s) {
      await setDoc(doc(db, 'users', uid, 'data', 'settings'), { ...s, updatedAt: new Date().toISOString() })
    },

    async getJournalEntries() {
      const q = query(collection(db, 'users', uid, 'journal'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map((d) => ({
        id: d.id,
        amount: d.data().amount ?? 0,
        text: d.data().text ?? '',
        createdAt: (d.data().createdAt as Timestamp).toDate(),
      }))
    },

    async addJournalEntry(e) {
      const ref = await addDoc(collection(db, 'users', uid, 'journal'), {
        amount: e.amount,
        text: e.text,
        createdAt: Timestamp.now(),
      })
      return { ...e, id: ref.id, createdAt: e.createdAt ?? new Date() }
    },

    async getStreak() {
      const snap = await getDoc(doc(db, 'users', uid, 'data', 'streak'))
      return snap.exists() ? (snap.data() as StreakData) : null
    },

    async saveStreak(s: StreakData) {
      await setDoc(doc(db, 'users', uid, 'data', 'streak'), s)
    },

    async getBarriers() {
      const snap = await getDoc(doc(db, 'users', uid, 'data', 'barriers'))
      if (!snap.exists()) return []
      const ids = snap.data().ids
      return Array.isArray(ids) ? ids : []
    },

    async saveBarriers(ids) {
      await setDoc(doc(db, 'users', uid, 'data', 'barriers'), { ids })
    },
  }
}

// Sign-in is the only moment both copies are genuinely live and we cannot tell
// by context which the user meant. Explicit file restores and the sign-out
// copy-down are different: there the source is authoritative by intent, so
// those keep letting the source win rather than going through this.
function newerSettings(a: Settings | null, b: Settings | null): Settings | null {
  if (!a) return b
  if (!b) return a
  const at = a.updatedAt ?? ''
  const bt = b.updatedAt ?? ''
  return bt > at ? b : a
}

/** Push current progress to Firestore, and pick up any leftover local data. */
export async function syncNowToCloud(
  uid: string,
  data: { settings: Settings; streak: StreakData },
): Promise<void> {
  const remote = firestoreAdapter(uid)
  await remote.saveSettings(data.settings)

  const leftoverStreak = await localStorageAdapter.getStreak()
  await remote.saveStreak(leftoverStreak ? mergeStreak(data.streak, leftoverStreak) : data.streak)

  const leftoverBarriers = await localStorageAdapter.getBarriers()
  const cloudBarriers = await remote.getBarriers()
  await remote.saveBarriers([...new Set([...cloudBarriers, ...leftoverBarriers])])

  const leftoverJournal = await localStorageAdapter.getJournalEntries()
  if (leftoverJournal.length) {
    const cloud = await remote.getJournalEntries()
    for (const e of [...leftoverJournal].reverse()) {
      const dup = cloud.some(
        (c) => c.text === e.text && Math.abs((c.amount ?? 0) - (e.amount ?? 0)) < 0.01,
      )
      if (!dup) await remote.addJournalEntry(e)
    }
  }

}

export async function migrateToFirestore(uid: string): Promise<boolean> {
  const settings = await localStorageAdapter.getSettings()
  const entries = await localStorageAdapter.getJournalEntries()
  const streak = await localStorageAdapter.getStreak()
  const barriers = await localStorageAdapter.getBarriers()
  const hasLocal = !!(settings || entries.length || streak || barriers.length)
  if (!hasLocal) return false

  const remote = firestoreAdapter(uid)
  const cloudSettings = await remote.getSettings()
  const winner = newerSettings(cloudSettings, settings)
  // Only write when local actually won. Rewriting the cloud copy would re-stamp
  // its updatedAt on every sign-in, after which local could never win again.
  if (winner && winner !== cloudSettings) await remote.saveSettings(winner)

  if (streak) {
    const cloudStreak = await remote.getStreak()
    await remote.saveStreak(cloudStreak ? mergeStreak(cloudStreak, streak) : streak)
  }

  if (barriers.length) {
    const cloudBarriers = await remote.getBarriers()
    await remote.saveBarriers([...new Set([...cloudBarriers, ...barriers])])
  }

  if (entries.length) {
    const cloud = await remote.getJournalEntries()
    for (const e of [...entries].reverse()) {
      const dup = cloud.some(
        (c) => c.text === e.text && Math.abs((c.amount ?? 0) - (e.amount ?? 0)) < 0.01,
      )
      if (!dup) await remote.addJournalEntry(e)
    }
  }

  // The device keeps its own copy until the user clears their browser. Erasing
  // it here is what made signing out look like the journal had been deleted:
  // a signed-out session reads local, and local had been emptied on sign-in.
  // Because local now survives, this runs again on the next sign-in, so every
  // write above has to be idempotent -- hence the dedupe and merges.
  return true
}

export async function deleteUserCloudData(uid: string): Promise<void> {
  const journal = await getDocs(collection(db, 'users', uid, 'journal'))
  await Promise.all(journal.docs.map((d) => deleteDoc(d.ref)))
  await Promise.all([
    deleteDoc(doc(db, 'users', uid, 'data', 'settings')).catch(() => undefined),
    deleteDoc(doc(db, 'users', uid, 'data', 'streak')).catch(() => undefined),
    deleteDoc(doc(db, 'users', uid, 'data', 'barriers')).catch(() => undefined),
    deletePostsByUser(uid).catch(() => undefined),
  ])
}
