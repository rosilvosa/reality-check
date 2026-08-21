# Spec: what Home shows after a loss is recorded

Status: done -- this documents behavior already shipped today (2026-08-18),
written after enough back-and-forth bug reports in this exact area that it
was worth a single reference instead of re-deriving it from the diff history.

## The event

'A loss is recorded' means one thing precisely: a Journal entry was saved
(journalStore.addEntry). Lost.tsx (the calculator) never saves anything on
its own -- it only hands off to Journal via the 'Write it down' link. So
everything below is keyed off 'does today have a Journal entry',
streakStore.lostToday(), not off having visited any particular page.

## What changes, in order, the moment that happens

1. **Streak resets.** Journal.tsx calls recordRelapse() right after the
   entry saves. currentStreak -> 0, lastCheckInDate -> null. longestStreak
   and startDate are kept (see the comment on recordRelapse in
   streakStore.ts for why). A same-day check-in is cleared too, not left
   standing -- you cannot be both 'checked in today' and 'lost today'.

2. **Home's big number goes to 0, softened.** The days-clean digit uses
   font-bold + text-muted at zero instead of font-black + text-ink -- a
   relapse (or a brand new start) should not render with the same visual
   weight as a real streak. Shipped today alongside this spec.

3. **The check-in control is replaced, not disabled.** Home and Progress
   both branch on lostToday(): a disabled button with no explanation reads
   as a broken app, so a day with a loss shows a plain status line
   (t.home.lostToday: 'you wrote down a loss today...') instead of a greyed
   out check-in button.

4. **The generic 'start counting' hint is suppressed.** startHint ('Check
   in to start counting clean days') is written for a brand new user, not
   someone who just relapsed, but both cases have days === 0. It no longer
   renders when lostTodayFlag is true, since the status line in (3) already
   covers that case more specifically. Two messages saying the same thing
   in different words was the bug reported and fixed today.

5. **Home's own room-wide badges do not move.** 'N checked in today' is an
   append-only daily count (see the room-naming/counter discussion the same
   day) -- a relapse does not decrement it, by design, not omission.

6. **Journal shows a two-door banner, not a lecture.** After the entry
   saves, Journal.tsx shows one link to a recovery-story video
   (RECOVERY_VIDEOS, language-matched when available, 'recovery' topic
   preferred over 'psychology' -- someone else's story, not a lecture) and
   one link to Progress's existing Fill the Void alternatives section.
   Nothing new was invented for this; both destinations already existed.

7. **Lost.tsx shows your own recent history, capped.** Up to 3 most recent
   losses (date + amount) appear on the calculator page, but only in the
   pre-calculation state -- never after a result renders, so it can never
   be the thing that pushes that page into scrolling.

## What does NOT happen

- No decrement of any shared/community counter (see 5).
- No change to the actual peso total shown on Progress ('What gambling has
  cost you') -- that is an intentional running total across all entries,
  distinct from Home's 'last time you wrote', which is deliberately just
  the most recent entry. Different questions, both kept.
- No calendar/scorecard on Journal itself -- the weekly failed/succeeded
  strip was built there first and moved to Progress the same day, since a
  red/green scorecard on the page you open to process a fresh loss reads as
  judgment at the exact moment shame is highest (see the journal weekly
  calendar spec).

## Known open item

Issue #12 (github.com/rosilvosa/reality-check/issues/12): a real bug where
the personal streak state could show stale/incorrect immediately after a
relapse on a signed-in account, traced to two related root causes (a cloud
write never mirroring back to the local seed cache, and journalStore having
no synchronous local seed at all) and fixed in both directions today. Not
yet confirmed closed on the reporting device.
