import { create } from 'zustand'
import { getAdapter } from '../lib/storage'
import { useAuthStore } from './authStore'
import type { JournalEntry } from '../types'

export type { JournalEntry }

interface JournalState {
  entries: JournalEntry[]
  loaded: boolean
  error: string | null
  loadJournal: () => Promise<void>
  addEntry: (data: { amount: number; text: string }) => Promise<void>
}

async function waitForAuth(): Promise<void> {
  if (!useAuthStore.getState().loading) return
  return new Promise<void>((resolve) => {
    const unsub = useAuthStore.subscribe((s) => {
      if (!s.loading) { unsub(); resolve() }
    })
  })
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  loaded: false,
  error: null,

  loadJournal: async () => {
    await waitForAuth()
    const { user } = useAuthStore.getState()
    try {
      const entries = await getAdapter(user).getJournalEntries()
      set({ entries, loaded: true, error: null })
    } catch (e) {
      set({ loaded: true, error: e instanceof Error ? e.message : 'Could not load journal' })
    }
  },

  addEntry: async ({ amount, text }) => {
    await waitForAuth()
    const { user } = useAuthStore.getState()
    try {
      const entry = await getAdapter(user).addJournalEntry({
        amount,
        text,
        createdAt: new Date(),
      })
      set({ entries: [entry, ...get().entries], error: null })
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Could not save journal entry' })
      throw e
    }
  },
}))
