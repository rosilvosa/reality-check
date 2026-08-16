import {
  doc, getDoc, setDoc, deleteDoc,
  collection, addDoc, getDocs, query, orderBy, Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Settings, JournalEntry, StreakData } from '../types'
import { deletePostsByUser } from './community'

const LS_SETTINGS = 'rc_settings'
const LS_JOURNAL  = 'rc_journal'
const LS_STREAK   = 'rc_streak'
const LS_BARRIERS = 'rc_barriers'

export const LOCAL_KEYS = [
  LS_SETTINGS, LS_JOURNAL, LS_STREAK, LS_BARRIERS, 'rc_onboarded', 'rc_lang',
] as const

export interface StorageAdapter {
  getSettings(): Promise<Settings | null>
  saveSettings(s: Settings): Promise<void>
  getJournalEntries(): Promise<JournalEntry[]>
  addJournalEntry(e: Omit<JournalEntry, 'id'>): Promise<JournalEntry>
  getStreak(): Promise<StreakData | null>
  saveStreak(s: StreakData): Promise<void>
  getBarriers(): Promise<string[]>
  saveBarriers(ids: string[]): Promise<void>
}

type CloudUser = { uid: string; isAnonymous: boolean } | null

const localStorageAdapter: StorageAdapter = {
  async getSettings() {
    try {
      const raw = localStorage.getItem(LS_SETTINGS)
      if (!raw) return null
      const d = JSON.parse(raw)
      return { ...d, helpRegion: d.helpRegion ?? 'PH', currency: d.currency ?? 'PHP' }
    } catch { return null }
  },

  async saveSettings(s) {
    localStorage.setItem(LS_SETTINGS, JSON.stringify(s))
  },

  async getJournalEntries() {
    try {
      const raw = localStorage.getItem(LS_JOURNAL)
      const arr: Array<JournalEntry & { createdAt: string | Date }> = raw ? JSON.parse(raw) : []
      return arr.map((e) => ({ ...e, createdAt: new Date(e.createdAt) }))
    } catch { return [] }
  },

  async addJournalEntry(e) {
    const existing = await localStorageAdapter.getJournalEntries()
    // Restores add many entries within the same millisecond, so Date.now()
    // alone produces duplicate ids and duplicate React keys.
    const id = `-`
    const entry: JournalEntry = { ...e, id, createdAt: e.createdAt ?? new Date() }
    const updated = [entry, ...existing]
    localStorage.setItem(
      LS_JOURNAL,
      JSON.stringify(updated.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() }))),
    )
    return entry
  },

  async getStreak() {
    try {
      const raw = localStorage.getItem(LS_STREAK)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  },

  async saveStreak(s) {
    localStorage.setItem(LS_STREAK, JSON.stringify(s))
  },

  async getBarriers() {
    try {
      const raw = localStorage.getItem(LS_BARRIERS)
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  },

  async saveBarriers(ids) {
    localStorage.setItem(LS_BARRIERS, JSON.stringify(ids))
  },
}

function firestoreAdapter(uid: string): StorageAdapter {
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
      }
    },

    async saveSettings(s) {
      await setDoc(doc(db, 'users', uid, 'data', 'settings'), s)
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

export function getAdapter(user: CloudUser): StorageAdapter {
  if (user && !user.isAnonymous) return firestoreAdapter(user.uid)
  return localStorageAdapter
}

/**
 * Barriers, read synchronously. The async adapter resolves a microtask later,
 * which is long enough to paint an empty checklist first and then snap to the
 * real one. Signed-out users can skip that flash entirely.
 */
export function readLocalBarriersSync(): string[] {
  try {
    const raw = localStorage.getItem(LS_BARRIERS)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function clearLocalRc(): void {
  for (const key of LOCAL_KEYS) localStorage.removeItem(key)
}

export function mergeStreak(a: StreakData, b: StreakData): StreakData {
  const aDate = a.lastCheckInDate ?? ''
  const bDate = b.lastCheckInDate ?? ''
  const later = bDate > aDate ? b : a
  return {
    currentStreak: Math.max(a.currentStreak, b.currentStreak),
    longestStreak: Math.max(a.longestStreak, b.longestStreak),
    lastCheckInDate: later.lastCheckInDate,
    milestonesSeen: [...new Set([...(a.milestonesSeen ?? []), ...(b.milestonesSeen ?? [])])],
    startDate: a.startDate && b.startDate
      ? (a.startDate < b.startDate ? a.startDate : b.startDate)
      : (a.startDate ?? b.startDate),
  }
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
  if (settings) await remote.saveSettings(settings)

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
