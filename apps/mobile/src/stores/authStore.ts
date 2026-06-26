import { create } from 'zustand'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db, ensureAnonymousAuth } from '../lib/firebase'
import type { User } from 'firebase/auth'

interface AuthState {
  user: User | null
  isPro: boolean
  loading: boolean
  init: () => void
  refreshProStatus: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isPro: false,
  loading: true,

  init() {
    ensureAnonymousAuth()
    onAuthStateChanged(auth, async user => {
      set({ user, loading: false })
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid, 'subscription'))
        set({ isPro: snap.exists() && snap.data()?.isPro === true })
      }
    })
  },

  async refreshProStatus() {
    const { user } = get()
    if (!user) return
    const snap = await getDoc(doc(db, 'users', user.uid, 'subscription'))
    set({ isPro: snap.exists() && snap.data()?.isPro === true })
  },
}))
