import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import axios from 'axios'
import * as crypto from 'crypto'

admin.initializeApp()

const db = admin.firestore()
const region = functions.region('asia-southeast1')

const MIN_PESOS = 20
const MAX_PESOS = 50000

export const createPaymongoCheckout = region.https.onCall(
  async (data: { amount?: number }) => {
    const pesos = Number(data?.amount)
    if (!Number.isFinite(pesos) || pesos < MIN_PESOS || pesos > MAX_PESOS) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        `Amount must be ₱${MIN_PESOS}–₱${MAX_PESOS.toLocaleString()}`,
      )
    }

    const secretKey = process.env.PAYMONGO_SECRET_KEY
    const appUrl = process.env.APP_URL ?? 'https://reality-check-ph.web.app'
    if (!secretKey) {
      throw new functions.https.HttpsError('internal', 'PayMongo key not configured')
    }

    const centavos = Math.round(pesos * 100)
    const encoded = Buffer.from(secretKey + ':').toString('base64')

    const response = await axios.post(
      'https://api.paymongo.com/v1/checkout_sessions',
      {
        data: {
          attributes: {
            line_items: [{
              currency: 'PHP',
              amount: centavos,
              name: 'Donation — Reality Check + safety app',
              quantity: 1,
            }],
            payment_method_types: ['gcash', 'paymaya', 'card', 'grab_pay', 'qrph'],
            success_url: `${appUrl}/settings?donation=success`,
            cancel_url: `${appUrl}/settings`,
            metadata: { kind: 'donation' },
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${encoded}`,
          'Content-Type': 'application/json',
        },
      },
    )

    const checkoutUrl: string = response.data.data.attributes.checkout_url
    return { checkoutUrl }
  },
)

export const paymongoWebhook = region.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return }

  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET
  if (!webhookSecret) {
    res.status(500).send('Webhook secret not configured')
    return
  }
  const sig = req.headers['paymongo-signature'] as string ?? ''
  const parts = Object.fromEntries(sig.split(',').map((p) => p.split('=')))
  const timestamp = parts['t']
  const v1 = parts['v1'] ?? ''
  const payload = `${timestamp}.${JSON.stringify(req.body)}`
  const expected = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex')
  if (expected !== v1) { res.status(400).send('Invalid signature'); return }

  const event = req.body?.data?.attributes?.type as string
  if (event === 'checkout_session.payment.paid') {
    const session = req.body?.data?.attributes?.data?.attributes ?? {}
    const amount = session.line_items?.[0]?.amount ?? session.payment_intent_data?.amount ?? null
    await db.collection('donations').add({
      kind: session.metadata?.kind ?? 'donation',
      amount,
      paidAt: admin.firestore.Timestamp.now(),
    })
  }

  res.status(200).send('ok')
})
