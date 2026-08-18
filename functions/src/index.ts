import * as admin from 'firebase-admin'
import * as functions from 'firebase-functions'
import axios from 'axios'

admin.initializeApp()

const db = admin.firestore()
const region = functions.region('asia-southeast1')

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

/**
 * One person cannot move the room total by more than this in a week. A real
 * week of losses can be large, but not so large that a single account should
 * be able to define the number everyone else sees.
 */
const WEEKLY_CAP_PER_USER = 200_000

/** Guard against an unbounded read if the collection ever gets flooded. */
const WEEK_SCAN_LIMIT = 5000

function manilaWeekStartDate(): Date {
  return new Date(`${mondayOf(manilaYmd())}T00:00:00+08:00`)
}

/**
 * Recomputes the weekly total from the `room_amounts` trail rather than adding
 * to a running sum. Derived beats accumulated here: a bad or spammed write is
 * corrected by the next legitimate one instead of being stuck on screen until
 * the week rolls over, with no way to fix it.
 */
async function recomputeWeekPesos(): Promise<void> {
  const weekStart = mondayOf(manilaYmd())
  const since = admin.firestore.Timestamp.fromDate(manilaWeekStartDate())

  const snap = await db
    .collection('room_amounts')
    .where('at', '>=', since)
    .limit(WEEK_SCAN_LIMIT)
    .get()

  if (snap.size >= WEEK_SCAN_LIMIT) {
    console.warn('room_amounts week scan hit its limit; total is understated')
  }

  const perUser = new Map<string, number>()
  for (const d of snap.docs) {
    const amount = Math.round(Number(d.get('amount')))
    if (!Number.isFinite(amount) || amount <= 0 || amount > 5_000_000) continue
    const uid = String(d.get('uid') ?? '')
    if (!uid) continue
    perUser.set(uid, Math.min(WEEKLY_CAP_PER_USER, (perUser.get(uid) ?? 0) + amount))
  }

  let pesos = 0
  for (const v of perUser.values()) pesos += v

  await liveRef.set({ weekStart, pesos }, { merge: true })
}

export const onRoomAmount = region.firestore
  .document('room_amounts/{id}')
  .onCreate(async () => {
    await recomputeWeekPesos()
  })

/**
 * Hearts are counted here, not by the client. The rules now deny writes to the
 * counter, so the only way to move it is to create or delete your own
 * `hearts/{uid}` document, which you can each do once.
 */
async function bumpHearts(postId: string, delta: number): Promise<void> {
  if (!postId) return
  const ref = db.doc(`community_posts/${postId}`)
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref)
    if (!snap.exists) return
    const cur = Number(snap.get('hearts')) || 0
    tx.update(ref, { hearts: Math.max(0, cur + delta) })
  })
}

export const onHeartAdded = region.firestore
  .document('community_posts/{postId}/hearts/{uid}')
  .onCreate((_snap, context) => bumpHearts(String(context.params.postId ?? ''), 1))

export const onHeartRemoved = region.firestore
  .document('community_posts/{postId}/hearts/{uid}')
  .onDelete((_snap, context) => bumpHearts(String(context.params.postId ?? ''), -1))

/**
 * Report counts are kept in their own collection, readable only by moderators,
 * and written only here. Keeping them off the post document means an ordinary
 * reader cannot tell which posts have been reported, which would turn the
 * report button into a way to publicly mark someone.
 */
export const onPostReported = region.firestore
  .document('community_posts/{postId}/reports/{uid}')
  .onCreate(async (_snap, context) => {
    const postId = String(context.params.postId ?? '')
    if (!postId) return
    const ref = db.doc(`community_moderation/${postId}`)
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(ref)
      const cur = Number(snap.get('reportCount')) || 0
      tx.set(ref, {
        reportCount: cur + 1,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true })
    })
  })

/** A removed post leaves no queue entry behind. */
export const onPostDeleted = region.firestore
  .document('community_posts/{postId}')
  .onDelete(async (_snap, context) => {
    const postId = String(context.params.postId ?? '')
    if (!postId) return
    await db.doc(`community_moderation/${postId}`).delete().catch(() => undefined)
  })
