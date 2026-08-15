import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithPopup,
  signOut as firebaseSignOut,
  deleteUser,
} from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import { clearLocalRc, deleteUserCloudData } from './storage'

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

export async function deleteAccountAndData(): Promise<void> {
  const user = auth.currentUser
  if (user && !user.isAnonymous) {
    await deleteUserCloudData(user.uid)
    try {
      await deleteUser(user)
    } catch {
      await firebaseSignOut(auth)
    }
  } else {
    await firebaseSignOut(auth)
  }
  clearLocalRc()
}
