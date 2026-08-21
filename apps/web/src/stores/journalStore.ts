import { create } from 'zustand'
import { getAdapter, readLocalJournalSync } from '../lib/storage'
import { recordHonestyCheckIn, recordRoomAmount } from '../lib/room'
import { localISODate } from '@rc/core'
import { useAuthStore } from './authStore'
import { useSettingsStore } from './settingsStore'
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

// Read once, synchronously, at module init -- before the store even exists --
// same pattern streakStore uses for readLocalStreakSync, for the same reason:
// the very first render should reflect what this device already knows,
// not an empty list that is guaranteed wrong for anyone with any history.
const seededEntries = readLocalJournalSync()

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: seededEntries,
  // Left false, not derived from whether a seed exists: this seed is only
  // ever good enough to answer "is there an entry for today," which is all
  // Home's lostToday() needs. Journal's own "Loading journal..." gate still
  // waits for the real loadJournal() fetch before showing the list or intercept.
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
      // Whether today already had a disclosure, checked against the entries
      // from *before* this one is added -- so the very entry just written
      // still counts as the day's first, not its second.
      const alreadyHonestToday = get().entries.some(
        (e) => localISODate(new Date(e.createdAt)) === localISODate(),
      )
      set({ entries: [entry, ...get().entries], error: null })
      const currency = useSettingsStore.getState().currency ?? 'PHP'
      await recordRoomAmount(amount, currency).catch(() => undefined)
      if (!alreadyHonestToday) {
        // The write is idempotent by document id regardless (a second create
        // on the same day's marker doc simply fails), so this guard only
        // saves a wasted attempt, it is not what prevents double counting.
        await recordHonestyCheckIn().catch(() => undefined)
      }
    } catch (e) {
      set({ error: e instanceof Error ? e.message : 'Could not save journal entry' })
      throw e
    }
  },
}))
