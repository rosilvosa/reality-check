import { create } from 'zustand'
import { getAdapter } from '../lib/storage'
import { useAuthStore } from './authStore'
import { useJournalStore } from './journalStore'
import type { StreakData } from '../types'

const MILESTONES = [1, 3, 7, 14, 30, 60, 90, 180, 365]

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterday(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
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
  showMilestoneModal: boolean
  newMilestone: number | null
  loadStreak: () => Promise<void>
  checkIn: () => Promise<void>
  dismissMilestone: () => Promise<void>
  getTotalSaved: () => number
}

export const useStreakStore = create<StreakState>((set, get) => ({
  ...defaultStreak(),
  loading: false,
  showMilestoneModal: false,
  newMilestone: null,

  loadStreak: async () => {
    set({ loading: true })
    const { user } = useAuthStore.getState()
    const adapter = getAdapter(user)
    const data = await adapter.getStreak()
    set({ ...(data ?? defaultStreak()), loading: false })
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
    await getAdapter(user).saveStreak(updated)

    set({
      ...updated,
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
    await getAdapter(user).saveStreak(updated)

    set({ milestonesSeen: seen, showMilestoneModal: false, newMilestone: null })
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
