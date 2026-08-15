import { create } from 'zustand'
import { getAdapter } from '../lib/storage'
import { useAuthStore } from './authStore'
import type { Asset, Settings, VoidType } from '../types'

export type { Asset }

interface SettingsState extends Settings {
  loaded: boolean
  loadSettings: () => Promise<void>
  saveSettings: (data: Settings) => Promise<void>
  setVoidType: (voidType: VoidType | null) => Promise<void>
}

const DEFAULT_ASSETS: Asset[] = [
  { name: '1 Week of Groceries', cost: 1500 },
  { name: '1 Month of Rent', cost: 8000 },
  { name: '1 Month of Utilities', cost: 2000 },
  { name: '1 Month of Medicine', cost: 1200 },
]

async function waitForAuth(): Promise<void> {
  if (!useAuthStore.getState().loading) return
  return new Promise<void>((resolve) => {
    const unsub = useAuthStore.subscribe((s) => {
      if (!s.loading) { unsub(); resolve() }
    })
  })
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  monthlyPay: 0,
  hoursPerMonth: 176,
  assets: DEFAULT_ASSETS,
  voidType: null,
  currency: 'PHP',
  loaded: false,

  loadSettings: async () => {
    await waitForAuth()
    const { user } = useAuthStore.getState()
    const data = await getAdapter(user).getSettings()
    if (data) set({ ...data, loaded: true })
    else set({ loaded: true })
  },

  saveSettings: async (data) => {
    await waitForAuth()
    const { user } = useAuthStore.getState()
    await getAdapter(user).saveSettings(data)
    set({ ...data })
  },

  setVoidType: async (voidType) => {
    await waitForAuth()
    const { user } = useAuthStore.getState()
    const s = get()
    await getAdapter(user).saveSettings({
      monthlyPay: s.monthlyPay,
      hoursPerMonth: s.hoursPerMonth,
      assets: s.assets,
      voidType,
      currency: s.currency ?? 'PHP',
    })
    set({ voidType })
  },
}))
