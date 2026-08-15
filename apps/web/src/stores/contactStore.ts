import { create } from 'zustand'

interface ContactState {
  open: boolean
  show: () => void
  hide: () => void
}

export const useContactStore = create<ContactState>((set) => ({
  open: false,
  show: () => set({ open: true }),
  hide: () => set({ open: false }),
}))
