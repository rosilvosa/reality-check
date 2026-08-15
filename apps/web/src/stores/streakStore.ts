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
  dismissMilestone: () => Promise<void>
  getTotalSaved: () => number
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

  getTotalSaved: () => {
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
