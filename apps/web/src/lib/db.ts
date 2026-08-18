import { getFirestore } from 'firebase/firestore'
import { app } from './firebase'

// Its own module so that importing `auth` does not drag the Firestore SDK in
// with it. Only lazily reached code imports this.
export const db = getFirestore(app)
