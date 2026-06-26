import {
  doc, getDoc, setDoc,
  collection, addDoc, getDocs, query, orderBy, Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Settings, JournalEntry, StreakData } from '../types'

const LS_SETTINGS = 'rc_settings'
const LS_JOURNAL  = 'rc_journal'
const LS_STREAK   = 'rc_streak'

export interface StorageAdapter {
  getSettings(): Promise<Settings | null>
  saveSettings(s: Settings): Promise<void>
  getJournalEntries(): Promise<JournalEntry[]>
  addJournalEntry(e: Omit<JournalEntry, 'id'>): Promise<JournalEntry>
  getStreak(): Promise<StreakData | null>
  saveStreak(s: StreakData): Promise<void>
}

// ── localStorage ──────────────────────────────────────────────────────────────

const localStorageAdapter: StorageAdapter = {
  async getSettings() {
    try {
      const raw = localStorage.getItem(LS_SETTINGS)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  },

  async saveSettings(s) {
    localStorage.setItem(LS_SETTINGS, JSON.stringify(s))
  },

  async getJournalEntries() {
    try {
      const raw = localStorage.getItem(LS_JOURNAL)
      const arr: any[] = raw ? JSON.parse(raw) : []
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
}

// ── Firestore ─────────────────────────────────────────────────────────────────

function firestoreAdapter(uid: string): StorageAdapter {
  return {
    async getSettings() {
      const snap = await getDoc(doc(db, 'users', uid, 'data', 'settings'))
      if (!snap.exists()) return null
      const d = snap.data()
      return { monthlyPay: d.monthlyPay ?? 0, hoursPerMonth: d.hoursPerMonth ?? 176, assets: d.assets ?? [] }
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
      const snap = await getDoc(doc(db, 'users', uid, 'streak', 'data'))
      return snap.exists() ? (snap.data() as StreakData) : null
    },

    async saveStreak(s: StreakData) {
      await setDoc(doc(db, 'users', uid, 'streak', 'data'), s)
    },
  }
}

// ── Factory ───────────────────────────────────────────────────────────────────
export function getAdapter(isPro: boolean, uid: string | null): StorageAdapter {
  if (isPro && uid) return firestoreAdapter(uid)
  return localStorageAdapter
}

export async function migrateToFirestore(uid: string): Promise<void> {
  const remote = firestoreAdapter(uid)

  const settings = await localStorageAdapter.getSettings()
  if (settings) await remote.saveSettings(settings)

  const entries = await localStorageAdapter.getJournalEntries()
  for (const e of [...entries].reverse()) {
    await remote.addJournalEntry(e)
  }

  localStorage.removeItem(LS_SETTINGS)
  localStorage.removeItem(LS_JOURNAL)
}
