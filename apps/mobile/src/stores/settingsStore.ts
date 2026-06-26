import { create } from 'zustand'
import { asyncStorageAdapter, firestoreAdapter } from '../lib/storage'
import { useAuthStore } from './authStore'
import type { Settings } from '@rc/core'

interface SettingsState {
  settings: Settings
  loading: boolean
  load: () => Promise<void>
  save: (s: Settings) => Promise<void>
}

function getAdapter() {
  const { user, isPro } = useAuthStore.getState()
  return isPro && user ? firestoreAdapter(user.uid) : asyncStorageAdapter
}

export const useSettingsStore = create<SettingsState>(set => ({
  settings: { monthlyPay: 0, hoursPerMonth: 176, assets: [] },
  loading: true,

  async load() {
    const s = await getAdapter().getSettings()
    set({ settings: s ?? { monthlyPay: 0, hoursPerMonth: 176, assets: [] }, loading: false })
  },

  async save(s) {
    await getAdapter().saveSettings(s)
    set({ settings: s })
  },
}))
