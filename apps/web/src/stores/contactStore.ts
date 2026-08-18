import { create } from 'zustand'

/** Matches the TYPES list in ContactModal. */
export type ContactKind = 'typeBug' | 'typeQuestion' | 'typePrivacy' | 'typeVideo' | 'typeOther'

interface ContactState {
  open: boolean
  /** Preselects the dropdown when something opened the form for a purpose. */
  presetKind: ContactKind | null
  show: (kind?: ContactKind) => void
  hide: () => void
}

export const useContactStore = create<ContactState>((set) => ({
  open: false,
  presetKind: null,
  show: (kind) => set({ open: true, presetKind: kind ?? null }),
  hide: () => set({ open: false, presetKind: null }),
}))
