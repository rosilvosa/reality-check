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
  async (data: { amount?: number }, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Sign in required.')
    }
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

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export const onContactMessageCreated = region.firestore
  .document('contact_messages/{id}')
  .onCreate(async (snap) => {
    const key = process.env.MAILERSEND_API_KEY
    const to = process.env.CONTACT_TO_EMAIL
    const from = process.env.CONTACT_FROM_EMAIL ?? 'noreply@davidsbeacon.com'
    if (!key || !to) {
      console.error('Contact email not configured')
      return
    }

    const d = snap.data()
    const kind = String(d.kind ?? 'Contact').slice(0, 80)
    const name = String(d.name ?? '').trim().slice(0, 120)
    const reply = String(d.email ?? '').trim().slice(0, 200)
    const message = String(d.message ?? '').trim().slice(0, 2000)
    if (!message) return

    const who = name || reply || 'Someone'
    const text = [
      `Reality Check contact — ${kind}`,
      `From: ${who}`,
      reply ? `Email: ${reply}` : 'Email: (none)',
      '',
      message,
    ].join('\n')

    const html = `
      <p><strong>Reality Check contact</strong> — ${escapeHtml(kind)}</p>
      <p>From: ${escapeHtml(who)}${reply ? `<br>Email: ${escapeHtml(reply)}` : '<br>Email: (none)'}</p>
      <pre style="white-space:pre-wrap;font-family:inherit">${escapeHtml(message)}</pre>
    `

    const payload: Record<string, unknown> = {
      from: { email: from, name: 'Reality Check' },
      to: [{ email: to }],
      subject: `Reality Check: ${kind}`,
      text,
      html,
    }
    if (reply && reply.includes('@')) {
      payload.reply_to = { email: reply, name: name || reply }
    }

    const response = await axios.post('https://api.mailersend.com/v1/email', payload, {
      headers: {
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      validateStatus: () => true,
    })
    if (response.status >= 300) {
      throw new Error(`MailerSend ${response.status}: ${JSON.stringify(response.data)}`)
    }

    await snap.ref.update({ emailedAt: admin.firestore.FieldValue.serverTimestamp() })
  })

function manilaYmd(d = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
}

function manilaYesterday(): string {
  const parts = manilaYmd().split('-').map(Number)
  const utc = Date.UTC(parts[0], parts[1] - 1, parts[2] - 1)
  return new Date(utc).toISOString().slice(0, 10)
}

function mondayOf(ymd: string): string {
  const [y, m, d] = ymd.split('-').map(Number)
  const utc = new Date(Date.UTC(y, m - 1, d))
  const wd = utc.getUTCDay()
  utc.setUTCDate(utc.getUTCDate() - (wd === 0 ? 6 : wd - 1))
  return utc.toISOString().slice(0, 10)
}

function dateAllowed(date: string): boolean {
  return date === manilaYmd() || date === manilaYesterday()
}

const liveRef = db.doc('public_stats/live')

export const onRoomCheckIn = region.firestore
  .document('checkins/{date}/users/{uid}')
  .onCreate(async (_snap, context) => {
    const date = String(context.params.date ?? '')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !dateAllowed(date)) return

    await db.runTransaction(async (tx) => {
      const snap = await tx.get(liveRef)
      const cur = snap.data() ?? {}
      const checkIns = cur.date === date ? Number(cur.checkIns) || 0 : 0
      tx.set(liveRef, { date, checkIns: checkIns + 1 }, { merge: true })
    })
  })

export const onRoomAmount = region.firestore
  .document('room_amounts/{id}')
  .onCreate(async (snap) => {
    const amount = Math.round(Number(snap.data()?.amount))
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5_000_000) return
    const weekStart = mondayOf(manilaYmd())

    await db.runTransaction(async (tx) => {
      const live = await tx.get(liveRef)
      const cur = live.data() ?? {}
      const pesos = cur.weekStart === weekStart ? Number(cur.pesos) || 0 : 0
      tx.set(liveRef, { weekStart, pesos: pesos + amount }, { merge: true })
    })
  })
