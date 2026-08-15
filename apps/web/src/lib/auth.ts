import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  linkWithPopup,
  linkWithCredential,
  signInWithCredential,
  EmailAuthProvider,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  deleteUser,
  type AuthError,
} from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import { clearLocalRc, deleteUserCloudData } from './storage'

function isAlreadyInUse(e: unknown): boolean {
  const code = (e as { code?: string })?.code
  return code === 'auth/credential-already-in-use' || code === 'auth/email-already-in-use'
}

async function isCurrentlyAnonymous() {
  return auth.currentUser?.isAnonymous ?? false
}

export async function signInWithGoogle() {
  if (await isCurrentlyAnonymous() && auth.currentUser) {
    try {
      return await linkWithPopup(auth.currentUser, googleProvider)
    } catch (e) {
      if (!isAlreadyInUse(e)) throw e
      const cred = GoogleAuthProvider.credentialFromError(e as AuthError)
      if (cred) return signInWithCredential(auth, cred)
      return signInWithPopup(auth, googleProvider)
    }
  }
  return signInWithPopup(auth, googleProvider)
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password)
}

export async function signUpWithEmail(email: string, password: string) {
  try {
    if (await isCurrentlyAnonymous() && auth.currentUser) {
      const cred = EmailAuthProvider.credential(email, password)
      return await linkWithCredential(auth.currentUser, cred)
    }
    return await createUserWithEmailAndPassword(auth, email, password)
  } catch (e) {
    if (!isAlreadyInUse(e)) throw e
    return signInWithEmailAndPassword(auth, email, password)
  }
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
