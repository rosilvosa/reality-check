import { create } from 'zustand'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  init: () => () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,

  init: () => {
    return onAuthStateChanged(auth, (user) => {
      set({ user: user ?? null, loading: false })
    })
  },
}))
