import { addDoc, collection, doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { manilaISODate, manilaMondayISODate } from '@rc/core'

export interface RoomStats {
  date: string
  checkIns: number
  weekStart: string
  pesos: number
}

const LIVE = doc(db, 'public_stats', 'live')

export function watchRoomStats(onChange: (s: RoomStats | null) => void): () => void {
  return onSnapshot(
    LIVE,
    (snap) => {
      if (!snap.exists()) {
        onChange({ date: manilaISODate(), checkIns: 0, weekStart: '', pesos: 0 })
        return
      }
      const d = snap.data()
      onChange({
        date: String(d.date ?? ''),
        checkIns: Number(d.checkIns) || 0,
        weekStart: String(d.weekStart ?? ''),
        pesos: Number(d.pesos) || 0,
      })
    },
    () => onChange(null),
  )
}

export async function recordRoomCheckIn(): Promise<void> {
  const uid = auth.currentUser?.uid
  if (!uid) return
  const date = manilaISODate()
  await setDoc(doc(db, 'checkins', date, 'users', uid), { at: serverTimestamp() })
}

export async function recordRoomAmount(amount: number, currency: string): Promise<void> {
  const uid = auth.currentUser?.uid
  if (!uid) return
  if ((currency || 'PHP') !== 'PHP') return
  const pesos = Math.round(amount)
  if (!Number.isFinite(pesos) || pesos <= 0 || pesos > 5_000_000) return
  await addDoc(collection(db, 'room_amounts'), { amount: pesos, uid, at: serverTimestamp() })
}

export function todayCheckIns(stats: RoomStats | null): number {
  if (!stats) return 0
  return stats.date === manilaISODate() ? stats.checkIns : 0
}

export function weekPesos(stats: RoomStats | null): number {
  if (!stats) return 0
  return stats.weekStart === manilaMondayISODate() ? stats.pesos : 0
}
