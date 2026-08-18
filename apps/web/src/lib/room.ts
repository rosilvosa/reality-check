import { manilaISODate, manilaMondayISODate } from '@rc/core'

export interface RoomStats {
  date: string
  checkIns: number
  weekStart: string
  pesos: number
}

// A facade over ./roomLive so that importing this does not pull in Firestore.
// The room card is decorative: it can arrive a moment after the page paints.
const loadLive = () => import('./roomLive')

export function watchRoomStats(onChange: (s: RoomStats | null) => void): () => void {
  let stop: (() => void) | null = null
  let cancelled = false
  loadLive()
    .then((m) => {
      // Unsubscribed before the module arrived, so never subscribe at all.
      if (cancelled) return
      stop = m.watchRoomStatsLive(onChange)
    })
    .catch(() => undefined)
  return () => {
    cancelled = true
    stop?.()
    stop = null
  }
}

export async function recordRoomCheckIn(): Promise<void> {
  const m = await loadLive()
  return m.recordRoomCheckIn()
}

export async function recordRoomAmount(amount: number, currency: string): Promise<void> {
  const m = await loadLive()
  return m.recordRoomAmount(amount, currency)
}

export function todayCheckIns(stats: RoomStats | null): number {
  if (!stats) return 0
  return stats.date === manilaISODate() ? stats.checkIns : 0
}

export function weekPesos(stats: RoomStats | null): number {
  if (!stats) return 0
  return stats.weekStart === manilaMondayISODate() ? stats.pesos : 0
}
