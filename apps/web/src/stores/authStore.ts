import { create } from 'zustand'
import { getIdTokenResult, onAuthStateChanged, type User } from 'firebase/auth'
import { auth } from '../lib/firebase'

interface AuthState {
  user: User | null
  loading: boolean
  /** From the moderator custom claim. Granted only by functions/scripts/set-moderator.mjs. */
  isModerator: boolean
  init: () => () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isModerator: false,

  init: () => {
    return onAuthStateChanged(auth, (user) => {
      set({ user: user ?? null, loading: false, isModerator: false })
      if (!user || user.isAnonymous) return
      // Forced refresh, so a freshly granted claim shows up without the person
      // having to work out that they need to sign out first.
      getIdTokenResult(user, true)
        .then((res) => set({ isModerator: res.claims.moderator === true }))
        .catch(() => set({ isModerator: false }))
    })
  },
}))
