import { create } from 'zustand'
import { localISODate, localYesterdayISODate } from '@rc/core'
import { getAdapter } from '../lib/storage'
import { recordRoomCheckIn } from '../lib/room'
import { useAuthStore } from './authStore'
import { useJournalStore } from './journalStore'
import type { StreakData } from '../types'

const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365]

function today(): string {
  return localISODate()
}

function yesterday(): string {
  return localYesterdayISODate()
}

function defaultStreak(): StreakData {
  return {
    currentStreak: 0,
    longestStreak: 0,
    lastCheckInDate: null,
    milestonesSeen: [],
    startDate: null,
  }
}

interface StreakState extends StreakData {
  loading: boolean
  error: string | null
  showMilestoneModal: boolean
  newMilestone: number | null
  loadStreak: () => Promise<void>
  checkIn: () => Promise<void>
  /** Resolves true if there was a streak or a check-in to lose. */
  recordRelapse: () => Promise<boolean>
  dismissMilestone: () => Promise<void>
  getTotalLost: () => number
  /** True if a loss was written down today. */
  lostToday: () => boolean
}

export const useStreakStore = create<StreakState>((set, get) => ({
  ...defaultStreak(),
  loading: true,
  error: null,
  showMilestoneModal: false,
  newMilestone: null,

  loadStreak: async () => {
    const { user } = useAuthStore.getState()
    try {
      const data = await getAdapter(user).getStreak()
      set({ ...(data ?? defaultStreak()), loading: false, error: null })
    } catch {
      // Never leave loading stuck true -- the counter would show a dash forever.
      set({ loading: false })
    }
  },

  checkIn: async () => {
    const state = get()
    const todayStr = today()
    if (state.lastCheckInDate === todayStr) return
    // The mirror of the relapse case. Without this you could write down a loss
    // and then check in for the same day, which is the same lie in reverse.
    if (get().lostToday()) return

    let newStreak: number
    if (state.lastCheckInDate === yesterday()) {
      newStreak = state.currentStreak + 1
    } else {
      newStreak = 1
    }

    const newLongest = Math.max(newStreak, state.longestStreak)
    const newStartDate = state.startDate ?? todayStr

    const hitMilestone = MILESTONES.find(
      (m) => m === newStreak && !state.milestonesSeen.includes(m)
    ) ?? null

    const updated: StreakData = {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastCheckInDate: todayStr,
      milestonesSeen: state.milestonesSeen,
      startDate: newStartDate,
    }

    const { user } = useAuthStore.getState()
    try {
      await getAdapter(user).saveStreak(updated)
    } catch (e) {
      // Do not apply the new streak locally -- it was not persisted, and a
      // counter that silently fails to move reads as "the app thinks I relapsed".
      set({ error: e instanceof Error ? e.message : 'Could not save your check-in' })
      return
    }
    await recordRoomCheckIn().catch(() => undefined)

    set({
      ...updated,
      error: null,
      showMilestoneModal: hitMilestone !== null,
      newMilestone: hitMilestone,
    })
  },

  /**
   * A journal entry means the person gambled. Nothing here used to break the
   * streak, so checking in and then logging a loss on the same day left the app
   * showing a clean day and a tick beside it. This app exists to stop exactly
   * that, so a loss clears today's check-in and puts the counter back to zero.
   *
   * longestStreak is kept, because it was really earned. startDate is kept so
   * Progress can still show its "streak reset" message.
   */
  recordRelapse: async () => {
    const state = get()
    const hadSomethingToLose = state.currentStreak > 0 || state.lastCheckInDate !== null
    if (!hadSomethingToLose) return false

    const updated: StreakData = {
      currentStreak: 0,
      longestStreak: state.longestStreak,
      // Cleared, not left on today, so "checked in today" cannot stay true.
      lastCheckInDate: null,
      milestonesSeen: state.milestonesSeen,
      startDate: state.startDate,
    }

    const { user } = useAuthStore.getState()
    try {
      await getAdapter(user).saveStreak(updated)
    } catch (e) {
      // The entry itself is already saved. Surface the failure rather than
      // pretending the streak reset when it did not persist.
      set({ error: e instanceof Error ? e.message : 'Could not update your streak' })
      return false
    }

    set({ ...updated, error: null })
    return true
  },

  dismissMilestone: async () => {
    const state = get()
    const milestone = state.newMilestone
    if (milestone === null) return

    const seen = [...state.milestonesSeen, milestone]
    const updated: StreakData = {
      currentStreak: state.currentStreak,
      longestStreak: state.longestStreak,
      lastCheckInDate: state.lastCheckInDate,
      milestonesSeen: seen,
      startDate: state.startDate,
    }

    const { user } = useAuthStore.getState()
    try {
      await getAdapter(user).saveStreak(updated)
    } finally {
      // Always dismiss. A modal that cannot be closed on a failed write is
      // the same trap as the onboarding overlay.
      set({ milestonesSeen: seen, showMilestoneModal: false, newMilestone: null })
    }
  },

  lostToday: () => {
    const todayStr = today()
    return useJournalStore.getState().entries.some(
      (e) => localISODate(new Date(e.createdAt)) === todayStr,
    )
  },

  getTotalLost: () => {
    return useJournalStore.getState().entries.reduce(
      (sum, e) => sum + (Number(e.amount) || 0),
      0,
    )
  },
}))

// Reload streak when auth changes
useAuthStore.subscribe((s) => {
  if (!s.loading) {
    useStreakStore.getState().loadStreak()
  }
})
