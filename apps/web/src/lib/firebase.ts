import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInAnonymously } from 'firebase/auth'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Auth only. Firestore comes from ./db, on demand, and the Functions SDK was
// exported here but never used by anything.
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

// Everyone needs an identity so page auth listeners fire, but this must wait
// until Firebase has finished restoring a persisted session. Calling
// signInAnonymously at module load races that restore: currentUser is still
// null, so Firebase mints a NEW anonymous user and evicts the signed-in one,
// orphaning their cloud journal. The PWA hid this -- a warm app never
// re-evaluates this module, so it only surfaced after a deploy forced a
// fresh load.
onAuthStateChanged(auth, (user) => {
  if (!user) signInAnonymously(auth).catch(console.error)
})
