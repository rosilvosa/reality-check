import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth'
import { auth, googleProvider } from './firebase'

async function isCurrentlyAnonymous() {
  return auth.currentUser?.isAnonymous ?? false
}

export async function signInWithGoogle() {
  if (await isCurrentlyAnonymous()) {
    return linkWithPopup(auth.currentUser!, googleProvider)
  }
  return signInWithPopup(auth, googleProvider)
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUpWithEmail(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password)
}

export async function signOut() {
  return firebaseSignOut(auth)
}
