import { httpsCallable } from 'firebase/functions'
import { functions } from './firebase'

export async function createDonationCheckout(amountPesos: number): Promise<string> {
  const fn = httpsCallable<{ amount: number }, { checkoutUrl: string }>(
    functions,
    'createPaymongoCheckout',
  )
  const result = await fn({ amount: amountPesos })
  return result.data.checkoutUrl
}
