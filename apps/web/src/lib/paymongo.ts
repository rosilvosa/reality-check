import { httpsCallable } from 'firebase/functions'
import { functions, auth } from './firebase'

export async function createCheckoutSession(): Promise<string> {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('Must be signed in to upgrade')

  const fn = httpsCallable<{ uid: string }, { checkoutUrl: string }>(
    functions,
    'createPaymongoCheckout',
  )
  const result = await fn({ uid })
  return result.data.checkoutUrl
}
