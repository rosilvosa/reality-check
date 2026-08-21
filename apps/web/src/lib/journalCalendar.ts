import { addDaysISODate, localISODate, localSundayISODate, visibleStreak } from '@rc/core'
import type { JournalEntry, StreakData } from '../types'

export type DayStatus = 'failed' | 'succeeded' | 'unknown'

/**
 * Journal has no pass/fail field of its own -- every entry already means a
 * loss (see journalStore.addEntry / streakStore.lostToday). So a day's
 * status is derived, not stored:
 *
 * - failed: a journal entry exists on that date. Certain, forever.
 * - succeeded: the date falls inside the *currently active* streak.
 *   Certain, but only for that one contiguous range -- streakStore keeps a
 *   running count and a last-check-in date, not a full calendar of past
 *   check-ins, so a day from a streak that later broke is not recoverable.
 * - unknown: everything else. Not a guess in either direction -- it must
 *   render differently from "succeeded", not as a default green/red.
 *
 * visibleStreak (not the raw currentStreak) is what decides the succeeded
 * range: if lastCheckInDate is not today or yesterday, the streak has
 * already gone stale from time passing without a visit, and its days
 * should not be back-filled as "succeeded" just because the counter has
 * not been reset yet.
 */
export function dayStatus(date: string, entries: JournalEntry[], streak: StreakData): DayStatus {
  if (entries.some((e) => localISODate(new Date(e.createdAt)) === date)) return 'failed'
  const streakLen = visibleStreak(streak.currentStreak, streak.lastCheckInDate)
  if (streakLen > 0 && streak.lastCheckInDate) {
    const streakStart = addDaysISODate(streak.lastCheckInDate, -(streakLen - 1))
    if (date >= streakStart && date <= streak.lastCheckInDate) return 'succeeded'
  }
  return 'unknown'
}

/** The 7 dates of the local Sunday-start week containing today, oldest first. */
export function currentWeekISODates(now = new Date()): string[] {
  const sunday = localSundayISODate(now)
  return Array.from({ length: 7 }, (_, i) => addDaysISODate(sunday, i))
}

/** Most recent journal entry on a given date, or undefined. Entries are
 * already sorted newest-first, so the first match is the one worth
 * scrolling to if there was more than one that day. */
export function entryForDate(date: string, entries: JournalEntry[]): JournalEntry | undefined {
  return entries.find((e) => localISODate(new Date(e.createdAt)) === date)
}
