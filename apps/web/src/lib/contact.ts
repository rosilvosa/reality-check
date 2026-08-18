import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './db'

const MAX = 2000

export async function sendContactMessage(data: {
  kind: string
  name: string
  email: string
  message: string
}): Promise<void> {
  const message = data.message.trim().slice(0, MAX)
  if (!message) throw new Error('empty')
  await addDoc(collection(db, 'contact_messages'), {
    kind: data.kind,
    name: data.name.trim().slice(0, 120),
    email: data.email.trim().slice(0, 200),
    message,
    createdAt: serverTimestamp(),
  })
}
