import { create } from 'zustand'
import { asyncStorageAdapter, firestoreAdapter } from '../lib/storage'
import { useAuthStore } from './authStore'
import type { JournalEntry } from '@rc/core'

interface JournalState {
  entries: JournalEntry[]
  loading: boolean
  load: () => Promise<void>
  addEntry: (amount: number, text: string) => Promise<void>
}

function getAdapter() {
  const { user, isPro } = useAuthStore.getState()
  return isPro && user ? firestoreAdapter(user.uid) : asyncStorageAdapter
}

export const useJournalStore = create<JournalState>(set => ({
  entries: [],
  loading: true,

  async load() {
    const entries = await getAdapter().getJournalEntries()
    set({ entries, loading: false })
  },

  async addEntry(amount, text) {
    await getAdapter().addJournalEntry({ amount, text, createdAt: new Date() })
    const entries = await getAdapter().getJournalEntries()
    set({ entries })
  },
}))
