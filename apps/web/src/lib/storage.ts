import {
  doc, getDoc, setDoc, deleteDoc,
  collection, addDoc, getDocs, query, orderBy, Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Settings, JournalEntry, StreakData } from '../types'

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
    const entry: JournalEntry = { ...e, id: Date.now().toString(), createdAt: e.createdAt ?? new Date() }
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

export function clearLocalRc(): void {
  for (const key of LOCAL_KEYS) localStorage.removeItem(key)
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
  for (const e of [...entries].reverse()) {
    await remote.addJournalEntry(e)
  }
  if (streak) await remote.saveStreak(streak)
  if (barriers.length) await remote.saveBarriers(barriers)

  localStorage.removeItem(LS_SETTINGS)
  localStorage.removeItem(LS_JOURNAL)
  localStorage.removeItem(LS_STREAK)
  localStorage.removeItem(LS_BARRIERS)
  return true
}

export async function deleteUserCloudData(uid: string): Promise<void> {
  const journal = await getDocs(collection(db, 'users', uid, 'journal'))
  await Promise.all(journal.docs.map((d) => deleteDoc(d.ref)))
  await Promise.all([
    deleteDoc(doc(db, 'users', uid, 'data', 'settings')).catch(() => undefined),
    deleteDoc(doc(db, 'users', uid, 'data', 'streak')).catch(() => undefined),
    deleteDoc(doc(db, 'users', uid, 'data', 'barriers')).catch(() => undefined),
  ])
}
