import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  serverTimestamp,
  where,
  writeBatch,
  type Timestamp,
} from 'firebase/firestore'
import { db } from './firebase'
import { resolveHelpRegion, type HelpRegion } from '@rc/core'

export const POST_TYPES = ['tip', 'urge', 'question', 'vent'] as const
export type PostType = (typeof POST_TYPES)[number]

export function normalizePostType(raw: unknown): PostType {
  if (raw === 'tip' || raw === 'urge' || raw === 'question' || raw === 'vent') return raw
  return 'vent'
}

export interface CommunityPost {
  id: string
  uid: string
  type: PostType
  text: string
  country: HelpRegion
  hearts: number
  createdAt: Date
}

const COL = 'community_posts'
const MAX = 500

function asDate(v: Timestamp | Date | undefined): Date {
  if (!v) return new Date()
  if (v instanceof Date) return v
  return v.toDate()
}

export function timeAgo(date: Date): string {
  const s = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h`
  const d = Math.floor(h / 24)
  if (d < 14) return `${d}d`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export async function fetchPosts(): Promise<CommunityPost[]> {
  const q = query(collection(db, COL), orderBy('createdAt', 'desc'), limit(80))
  const snap = await getDocs(q)
  return snap.docs.map((d) => {
    const data = d.data()
    return {
      id: d.id,
      uid: String(data.uid ?? ''),
      type: normalizePostType(data.type),
      text: String(data.text ?? ''),
      country: resolveHelpRegion(data.country),
      hearts: Number(data.hearts ?? 0),
      createdAt: asDate(data.createdAt),
    }
  })
}

export async function createPost(uid: string, type: PostType, text: string, country: HelpRegion): Promise<void> {
  const trimmed = text.trim().slice(0, MAX)
  if (!trimmed) throw new Error('empty')
  await addDoc(collection(db, COL), {
    uid,
    type,
    text: trimmed,
    country,
    hearts: 0,
    createdAt: serverTimestamp(),
  })
}

export async function deletePost(id: string): Promise<void> {
  await deleteDoc(doc(db, COL, id))
}

export async function toggleHeart(postId: string, uid: string, on: boolean): Promise<void> {
  const postRef = doc(db, COL, postId)
  const heartRef = doc(db, COL, postId, 'hearts', uid)
  const batch = writeBatch(db)
  if (on) {
    batch.set(heartRef, { createdAt: serverTimestamp() })
    batch.update(postRef, { hearts: increment(1) })
  } else {
    batch.delete(heartRef)
    batch.update(postRef, { hearts: increment(-1) })
  }
  await batch.commit()
}

export async function deletePostsByUser(uid: string): Promise<void> {
  const q = query(collection(db, COL), where('uid', '==', uid), limit(100))
  const snap = await getDocs(q)
  await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)))
}

export function heartKey(uid: string): string {
  return `rc_hearts_${uid}`
}

export function loadLocalHearts(uid: string): Set<string> {
  try {
    const raw = localStorage.getItem(heartKey(uid))
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

export function saveLocalHearts(uid: string, ids: Set<string>): void {
  localStorage.setItem(heartKey(uid), JSON.stringify([...ids]))
}
