import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import axios from 'axios'
import * as crypto from 'crypto'

admin.initializeApp()

const db = admin.firestore()

// ── Create PayMongo checkout session ─────────────────────────────────────────

const region = functions.region('asia-southeast1')

export const createPaymongoCheckout = region.https.onCall(
  async (data: { uid: string }, context) => {
    const uid = data.uid
    if (!uid) throw new functions.https.HttpsError('invalid-argument', 'uid required')

    const secretKey = process.env.PAYMONGO_SECRET_KEY
    const appUrl    = process.env.APP_URL ?? 'https://reality-check.web.app'

    if (!secretKey) {
      throw new functions.https.HttpsError('internal', 'PayMongo key not configured')
    }

    const encoded = Buffer.from(secretKey + ':').toString('base64')

    const response = await axios.post(
      'https://api.paymongo.com/v1/checkout_sessions',
      {
        data: {
          attributes: {
            line_items: [{
              currency: 'PHP',
              amount: 29900,
              name: 'Reality Check — Lifetime Pro',
              quantity: 1,
            }],
            payment_method_types: ['gcash', 'paymaya', 'card', 'grab_pay', 'qrph'],
            success_url: `${appUrl}/?payment=success`,
            cancel_url: `${appUrl}/settings`,
            metadata: { uid },
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

// ── PayMongo webhook ──────────────────────────────────────────────────────────

export const paymongoWebhook = region.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return }

  const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET
  if (webhookSecret) {
    const sig       = req.headers['paymongo-signature'] as string ?? ''
    const parts     = Object.fromEntries(sig.split(',').map((p) => p.split('=')))
    const timestamp = parts['t']
    const v1        = parts['v1'] ?? ''
    const payload   = `${timestamp}.${JSON.stringify(req.body)}`
    const expected  = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex')
    if (expected !== v1) { res.status(400).send('Invalid signature'); return }
  }

  const event = req.body?.data?.attributes?.type as string
  if (event === 'checkout_session.payment.paid') {
    const meta = req.body?.data?.attributes?.data?.attributes?.metadata ?? {}
    const uid: string = meta.uid
    if (uid) {
      await db.doc(`users/${uid}/subscription`).set({
        isPro: true,
        paidAt: admin.firestore.Timestamp.now(),
        amount: 29900,
      }, { merge: true })
    }
  }

  res.status(200).send('ok')
})
