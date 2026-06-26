import { create } from 'zustand'
import { asyncStorageAdapter, firestoreAdapter } from '../lib/storage'
import { useAuthStore } from './authStore'
import { MILESTONES } from '@rc/core'
import type { StreakData } from '@rc/core'

interface StreakState {
  streak: StreakData
  loading: boolean
  showMilestoneModal: boolean
  newMilestone: number | null
  load: () => Promise<void>
  checkIn: () => Promise<void>
  dismissMilestone: () => Promise<void>
}

const DEFAULT_STREAK: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastCheckInDate: null,
  milestonesSeen: [],
  startDate: null,
}

function getAdapter() {
  const { user, isPro } = useAuthStore.getState()
  return isPro && user ? firestoreAdapter(user.uid) : asyncStorageAdapter
}

function toDateStr(d: Date) {
  return d.toISOString().split('T')[0]
}

export const useStreakStore = create<StreakState>((set, get) => ({
  streak: DEFAULT_STREAK,
  loading: true,
  showMilestoneModal: false,
  newMilestone: null,

  async load() {
    const s = await getAdapter().getStreak()
    set({ streak: s ?? DEFAULT_STREAK, loading: false })
  },

  async checkIn() {
    const today = toDateStr(new Date())
    const yesterday = toDateStr(new Date(Date.now() - 86400000))
    const { streak } = get()

    if (streak.lastCheckInDate === today) return

    let currentStreak = streak.lastCheckInDate === yesterday
      ? streak.currentStreak + 1
      : 1

    const longestStreak = Math.max(currentStreak, streak.longestStreak)
    const startDate = streak.startDate ?? today

    const hitMilestone = MILESTONES.find(
      m => m === currentStreak && !streak.milestonesSeen.includes(m)
    )

    const updated: StreakData = {
      currentStreak,
      longestStreak,
      lastCheckInDate: today,
      milestonesSeen: hitMilestone
        ? [...streak.milestonesSeen, hitMilestone]
        : streak.milestonesSeen,
      startDate,
    }

    await getAdapter().saveStreak(updated)
    set({
      streak: updated,
      showMilestoneModal: !!hitMilestone,
      newMilestone: hitMilestone ?? null,
    })
  },

  async dismissMilestone() {
    set({ showMilestoneModal: false, newMilestone: null })
  },
}))
