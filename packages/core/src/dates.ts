/** Local calendar date as YYYY-MM-DD. Do not use UTC — PH is UTC+8. */
export function localISODate(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function localYesterdayISODate(from = new Date()): string {
  return localISODate(new Date(from.getFullYear(), from.getMonth(), from.getDate() - 1))
}

export function localMondayISODate(from = new Date()): string {
  const wd = from.getDay()
  const back = wd === 0 ? 6 : wd - 1
  return localISODate(new Date(from.getFullYear(), from.getMonth(), from.getDate() - back))
}


/**
 * PH calendar date as YYYY-MM-DD regardless of the device's own timezone.
 * The shared "room" stats are bucketed server-side by Asia/Manila time
 * (see functions/src/index.ts manilaYmd) -- a device set to another timezone
 * must anchor to the same Manila day/week or its check-ins and amounts can
 * silently fall outside the window the server is counting.
 */
export function manilaISODate(d = new Date()): string {
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' })
}

export function manilaMondayISODate(d = new Date()): string {
  const ymd = manilaISODate(d)
  const [y, m, day] = ymd.split('-').map(Number)
  const wd = new Date(Date.UTC(y, m - 1, day)).getUTCDay()
  const back = wd === 0 ? 6 : wd - 1
  const utc = new Date(Date.UTC(y, m - 1, day - back))
  return utc.toISOString().slice(0, 10)
}
/** Days to show before today's check-in. Yesterday still counts; a gap is 0. */
export function visibleStreak(
  currentStreak: number,
  lastCheckInDate: string | null,
  now = new Date(),
): number {
  if (!lastCheckInDate || currentStreak <= 0) return 0
  const today = localISODate(now)
  const yesterday = localYesterdayISODate(now)
  if (lastCheckInDate === today || lastCheckInDate === yesterday) return currentStreak
  return 0
}
