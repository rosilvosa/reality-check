import { create } from 'zustand'
import { getAdapter } from '../lib/storage'
import { useAuthStore } from './authStore'
import type { JournalEntry } from '../types'

export type { JournalEntry }

interface JournalState {
  entries: JournalEntry[]
  loaded: boolean
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

  loadJournal: async () => {
    await waitForAuth()
    const { isPro, user } = useAuthStore.getState()
    const entries = await getAdapter(isPro, user?.uid ?? null).getJournalEntries()
    set({ entries, loaded: true })
  },

  addEntry: async ({ amount, text }) => {
    await waitForAuth()
    const { isPro, user } = useAuthStore.getState()
    const entry = await getAdapter(isPro, user?.uid ?? null).addJournalEntry({
      amount,
      text,
      createdAt: new Date(),
    })
    set({ entries: [entry, ...get().entries] })
  },
}))
