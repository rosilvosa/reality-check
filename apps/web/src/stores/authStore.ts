import { create } from 'zustand'
import { onAuthStateChanged, type User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase'
import { migrateToFirestore } from '../lib/storage'

interface AuthState {
  user: User | null
  isPro: boolean
  loading: boolean
  init: () => () => void
  refreshProStatus: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isPro: false,
  loading: true,

  init: () => {
    return onAuthStateChanged(auth, async (user) => {
      if (user && !user.isAnonymous) {
        const subSnap = await getDoc(doc(db, 'users', user.uid, 'subscription'))
        const isPro = subSnap.exists() && subSnap.data()?.isPro === true
        set({ user, isPro, loading: false })
      } else {
        set({ user: user ?? null, isPro: false, loading: false })
      }
    })
  },

  refreshProStatus: async () => {
    const { user } = get()
    if (!user || user.isAnonymous) return
    const wasNotPro = !get().isPro
    const subSnap = await getDoc(doc(db, 'users', user.uid, 'subscription'))
    const isPro = subSnap.exists() && subSnap.data()?.isPro === true
    set({ isPro })
    if (isPro && wasNotPro) {
      migrateToFirestore(user.uid).catch(console.error)
    }
  },
}))
