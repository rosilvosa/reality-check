import AsyncStorage from '@react-native-async-storage/async-storage'
import {
  doc, getDoc, setDoc, collection,
  addDoc, getDocs, orderBy, query, Timestamp
} from 'firebase/firestore'
import { db } from './firebase'
import type { Settings, JournalEntry, StreakData } from '@rc/core'

export interface StorageAdapter {
  getSettings(): Promise<Settings | null>
  saveSettings(s: Settings): Promise<void>
  getJournalEntries(): Promise<JournalEntry[]>
  addJournalEntry(e: Omit<JournalEntry, 'id'>): Promise<void>
  getStreak(): Promise<StreakData | null>
  saveStreak(s: StreakData): Promise<void>
}

const DEFAULT_SETTINGS: Settings = {
  monthlyPay: 0,
  hoursPerMonth: 176,
  assets: [
    { name: '1 Week of Groceries', cost: 1500 },
    { name: '1 Month of Rent', cost: 8000 },
    { name: '1 Month of Utilities', cost: 2000 },
    { name: '1 Month of Medicine', cost: 1200 },
  ],
}

export const asyncStorageAdapter: StorageAdapter = {
  async getSettings() {
    const raw = await AsyncStorage.getItem('rc_settings')
    return raw ? JSON.parse(raw) : DEFAULT_SETTINGS
  },
  async saveSettings(s) {
    await AsyncStorage.setItem('rc_settings', JSON.stringify(s))
  },
  async getJournalEntries() {
    const raw = await AsyncStorage.getItem('rc_journal')
    const entries: JournalEntry[] = raw ? JSON.parse(raw) : []
    return entries.map(e => ({ ...e, createdAt: new Date(e.createdAt) }))
  },
  async addJournalEntry(e) {
    const entries = await asyncStorageAdapter.getJournalEntries()
    entries.unshift({ ...e, id: Date.now().toString(), createdAt: new Date() })
    await AsyncStorage.setItem('rc_journal', JSON.stringify(entries))
  },
  async getStreak() {
    const raw = await AsyncStorage.getItem('rc_streak')
    return raw ? JSON.parse(raw) : null
  },
  async saveStreak(s) {
    await AsyncStorage.setItem('rc_streak', JSON.stringify(s))
  },
}

export function firestoreAdapter(uid: string): StorageAdapter {
  const userRef = (path: string) => doc(db, 'users', uid, path)
  const colRef = (path: string) => collection(db, 'users', uid, path)

  return {
    async getSettings() {
      const snap = await getDoc(userRef('settings'))
      return snap.exists() ? (snap.data() as Settings) : DEFAULT_SETTINGS
    },
    async saveSettings(s) {
      await setDoc(userRef('settings'), s)
    },
    async getJournalEntries() {
      const q = query(colRef('journal'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      return snap.docs.map(d => {
        const data = d.data()
        return {
          id: d.id,
          amount: data.amount,
          text: data.text,
          createdAt: (data.createdAt as Timestamp).toDate(),
        }
      })
    },
    async addJournalEntry(e) {
      await addDoc(colRef('journal'), { ...e, createdAt: Timestamp.now() })
    },
    async getStreak() {
      const snap = await getDoc(userRef('streak'))
      return snap.exists() ? (snap.data() as StreakData) : null
    },
    async saveStreak(s) {
      await setDoc(userRef('streak'), s)
    },
  }
}
