# Spec: Journal weekly calendar (failed vs succeeded days)

Status: done, then relocated. Tracked as [issue #11](https://github.com/rosilvosa/reality-check/issues/11), deployed to reality-check-ph. Shipped on Journal first as specced below; moved to Progress the same day after Ron flagged that a red/green scorecard on the page you open to process a fresh loss reads as judgment at the worst possible moment -- the same shame-without-a-witness risk already reasoned through for the old peso ticker on Home (see 2026-08-18-honesty-disclosure-count.md). Everything below (derivation, colors, week-start, copy) is unchanged; only the page it lives on and the tap target changed (links to /journal instead of scrolling to an entry, since Progress has no entry list of its own).

## Why

Journal is currently a flat, reverse-chronological list of loss entries.
There is no way to see a pattern across a week -- "I always slip on payday,"
"weekends are worse" -- without scrolling and reading every entry by hand.
A 7-day strip that marks each day failed/succeeded/unknown at a glance
answers that without adding a new feature to maintain data for; the answer
mostly already exists in data the app collects today.

## What "failed" and "succeeded" mean (the open question from the issue)

Journal has no pass/fail field -- every Journal entry already means a loss
(addEntry takes { amount, text }; streakStore.lostToday() already checks
"does today have a journal entry" to decide whether a check-in is even
allowed). So:

- **Failed** = a Journal entry exists with createdAt on that date. Certain,
  for any date, forever -- journal entries are permanent records.
- **Succeeded** = the date falls inside the user's *current, unbroken*
  streak: from lastCheckInDate back (currentStreak - 1) days, i.e. the
  contiguous run of check-ins that has not been reset by a relapse since it
  started. Certain, but only for that one contiguous range.
- **Unknown / no entry** = everything else -- before the app was installed,
  a day the person simply did not open the app, or a day before an earlier
  relapse whose streak was reset. This is the honest answer, not a guess in
  either direction, and it must render visibly differently from
  "succeeded" -- a blank/neutral day, not a green one.

This is a real constraint, not a simplification for later: streakStore only
persists currentStreak + lastCheckInDate + startDate + longestStreak. It
does **not** persist a full calendar of past check-in dates, so a broken
streak's individual days are genuinely not recoverable from existing data.
A 7-day window makes this mostly moot in practice (most weeks are either
"still on the current streak" or "relapsed this week, so the failed day is
known and the days after it are the new streak"), but it will visibly
undercount on a week that contains an old, already-broken streak. Call this
out in the UI copy rather than silently rendering "unknown" days as if nothing
happened -- see Copy below.

Do not add a new persisted daily-status log to close this gap as part of
this feature. That is a bigger, separate data-model change (a new
collection or array, its own security rules, its own migration for
existing users) for a gap that a 7-day window mostly does not hit. Revisit
only if a future feature needs a longer history (e.g. a monthly view),
not for this one.

## What changes

Add a 7-day strip above (or in place of, see Layout below) the entry list
on Journal.tsx: one cell per day, most recent 7 days ending today. Each
cell shows the day-of-week letter/number and one of three states:

- Failed: filled red-ish dot/cell (reuse --rc-accent, the color the rest of
  the app already uses for loss/urgency).
- Succeeded: filled green-ish dot/cell (reuse --rc-support, the color
  already meaning "connection/positive" on Help and Community).
- Unknown: empty/outline cell, muted border, no fill.

Today's cell gets a visual marker (ring or bold border) distinguishing "no
data yet because the day is not over" from "unknown because we have no
record," since those read very differently to someone checking the app
first thing in the morning.

## Week start

Sunday-start, per Ron: the week beginning on the day of rest, ahead of the
days you're accountable for, fits a recovery framing better than the
Monday/ISO default most calendar libraries ship with -- and it also
matches Philippine convention, where Sunday-start is more familiar than
ISO's Monday-start. One-line change to the day-offset math either way,
noted here so it is a decision, not a default nobody chose.

## Layout: summary above the list, not a replacement

The calendar sits in its own card above the existing entry list, not in
place of it. The list still answers "what did I write," the calendar
answers "when" -- different questions, both worth keeping. Tapping a
failed day scrolls to/highlights that day's entry in the list below (there
is at most one Journal entry per day already surfaced this way, since
lostToday() and the honesty check-in are both keyed to "first entry of the
day"); tapping a succeeded or unknown day does nothing, since there is
nothing below it to jump to.

## Data / derivation (no new backend)

Entirely client-side, computed from data already loaded on this page:

```
function dayStatus(date: string, entries: JournalEntry[], streak: StreakData): 'failed' | 'succeeded' | 'unknown' {
  if (entries.some(e => localISODate(new Date(e.createdAt)) === date)) return 'failed'
  if (streak.lastCheckInDate && date <= streak.lastCheckInDate) {
    const streakStart = addDays(streak.lastCheckInDate, -(streak.currentStreak - 1))
    if (date >= streakStart) return 'succeeded'
  }
  return 'unknown'
}
```

No new Firestore collection, no new Cloud Function, no new security rule --
the honesty-disclosure feature this session added a new collection because
it needed a cross-user aggregate; this feature is purely "look at data this
one user already has loaded," so it does not.

## Copy

New keys needed (types.ts + all 5 locales, same as every other feature this
session):

- journal.calendarTitle -- e.g. "This week"
- journal.calendarUnknownHint -- short caption below the strip explaining
  gaps honestly, e.g. "Blank days mean no record, not necessarily a slip."
  This line is doing real work (see the Unknown section above) and should
  not be cut for space.

## What this does NOT change

- Journal's entry list, its data model, or addEntry -- purely additive.
- streakStore -- read-only consumer of currentStreak/lastCheckInDate, no
  new fields.
- Does not attempt to reconstruct history before the current streak. See
  "What failed/succeeded mean" above for why that is a deliberate scope
  cut, not an oversight.

## Order of operations if picked up

1. Build dayStatus() as a pure function with unit-style manual test cases
   covering: mid-streak day, day of a relapse, day before app was ever
   used, today with no check-in yet.
2. Build the strip UI, wire the tap-to-scroll behavior.
3. i18n pass across all 5 locales for the two new copy keys.
4. Typecheck, build, browser-verify on Journal with a real account that has
   at least one relapse in its history (not just a clean streak), since
   that is the case most likely to render wrong.
