import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from './db'

/**
 * Aggregate counters, one doc per video, keyed by youtubeId. Both counters are
 * owned by Cloud Functions (see functions/src/index.ts onVideoViewed /
 * onVideoHearted / onVideoUnhearted) -- the same shape as community post
 * hearts, and for the same reason: a client that could set these numbers
 * directly could invent them.
 */
export interface VideoStats {
  views: number
  hearts: number
}

const COL = 'video_stats'

export async function fetchVideoStats(): Promise<Record<string, VideoStats>> {
  const snap = await getDocs(collection(db, COL))
  const out: Record<string, VideoStats> = {}
  for (const d of snap.docs) {
    out[d.id] = {
      views: Number(d.get('views')) || 0,
      hearts: Number(d.get('hearts')) || 0,
    }
  }
  return out
}

/**
 * Records that this viewer opened this video. Idempotent by document id, so
 * calling it every time someone presses play is fine -- the counter only ever
 * moves on the document's first creation, and every write after that is a
 * silent no-op rather than a re-trigger.
 */
export async function recordVideoView(videoId: string, uid: string): Promise<void> {
  await setDoc(doc(db, COL, videoId, 'viewers', uid), { createdAt: serverTimestamp() })
}

export async function toggleVideoHeart(videoId: string, uid: string, on: boolean): Promise<void> {
  const ref = doc(db, COL, videoId, 'hearts', uid)
  if (on) await setDoc(ref, { createdAt: serverTimestamp() })
  else await deleteDoc(ref)
}

export function videoHeartKey(uid: string): string {
  return `rc_video_hearts_${uid}`
}

export function loadLocalVideoHearts(uid: string): Set<string> {
  try {
    const raw = localStorage.getItem(videoHeartKey(uid))
    return new Set(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

export function saveLocalVideoHearts(uid: string, ids: Set<string>): void {
  try {
    localStorage.setItem(videoHeartKey(uid), JSON.stringify([...ids]))
  } catch { /* ignore */ }
}
