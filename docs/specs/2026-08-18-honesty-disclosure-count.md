# Spec: replace the weekly peso figure with an honesty-disclosure count

Status: not started. Layout for the two-stat card landed first (see the
"Two columns when both numbers exist" commit on this date); this spec covers
the second stat itself, which still shows `weekPesos` today.

## Why

The room stats card currently pairs two numbers: how many people checked in
today, and how many pesos were lost this week. Checked-in-today is a
positive descriptive norm ("people like me are doing the thing today") --
the same mechanism mutual-aid groups rely on. The peso figure is weaker on
both counts:

- **Normalization risk.** Cialdini's classic finding on descriptive norms is
  that stating "many people do X" can normalize X even when framed as a
  warning (the petrified-forest-theft study: telling visitors "many people
  steal wood here" increased theft). Someone in early recovery, half-looking
  for permission, could read "P6,400 lost this week" as "everyone's still
  losing, so it's not just me" -- the opposite of the intended effect.
- **Shame without a witness.** Addiction literature is fairly consistent
  that shame (not guilt) is a relapse trigger, and shame only becomes
  constructive when someone hears it and responds. A floating aggregate
  can't do that; the Community feed can.

## What changes

Count **people who disclosed a loss today**, not the sum of what they lost.
Same underlying event -- someone wrote a journal entry -- but the number
becomes "N people were honest about a hard day today" instead of "here is
how much money is gone." This is a reframing of what's true, not a
softening of it: the actual peso amount stays fully visible on the
individual's own Progress page (t.progress.costBefore, already correctly
labelled as a cost, not a saving, since #9). Nothing is hidden -- the
ambient community ticker just foregrounds a different true fact about the
same event.

It also fixes the structural mismatch in the two-tile layout: both tiles
become the same shape, "N people did a real thing today," rather than one
count and one currency amount.

## Data model

Mirrors the existing onRoomCheckIn / checkins/{date}/users/{uid} pattern
exactly, so there's no new pattern to review, just a parallel one for a
different event.

**New collection:** honesty_checkins/{date}/users/{uid}

- Written once per user per day, the first time they save a journal entry
  that day (not once per entry -- a second loss the same day should not
  inflate the count).
- Same shape as checkins/{date}/users/{uid}: an empty/near-empty marker
  doc, the date and uid are what matters, not the payload.

**Firestore rule**, alongside the existing checkins rule:

match /honesty_checkins/{date}/users/{uid} {
  allow create: if request.auth != null
    && request.auth.uid == uid
    && date.matches('^[0-9]{4}-[0-9]{2}-[0-9]{2}$');
  allow read, update, delete: if false;
}

**Cloud Function**, alongside onRoomCheckIn in functions/src/index.ts:

export const onHonestyCheckIn = region.firestore
  .document('honesty_checkins/{date}/users/{uid}')
  .onCreate(async (_snap, context) => {
    const date = String(context.params.date ?? '')
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !dateAllowed(date)) return
    await db.runTransaction(async (tx) => {
      const snap = await tx.get(liveRef)
      const cur = snap.data() ?? {}
      const honestyCount = cur.honestyDate === date ? Number(cur.honestyCount) || 0 : 0
      tx.set(liveRef, { honestyDate: date, honestyCount: honestyCount + 1 }, { merge: true })
    })
  })

Reuses liveRef (public_stats/live) rather than a new document -- it already
holds date/checkIns and weekStart/pesos as independent fields, so a third
independent pair (honestyDate/honestyCount) fits the same document without
interfering with the other two.

## Client changes

**apps/web/src/lib/room.ts** -- add recordHonestyCheckIn() alongside
recordRoomCheckIn(), and todayHonestyCount(stats) alongside
todayCheckIns(stats). Same shape, same file, same lazy-load facade over
roomLive.ts that already exists for the other two.

**apps/web/src/stores/journalStore.ts** -- in addEntry, call
recordHonestyCheckIn() once per day. Needs a local "have I already recorded
today" guard (check entries for one from today before this save, same test
isToday() already does in Journal.tsx) so a second entry the same day
doesn't re-trigger it -- the write itself is idempotent by document id (a
second create on the same honesty_checkins/{date}/users/{uid} doc simply
fails/no-ops), so calling it twice in the same day is safe even without the
client-side guard, but the guard avoids a wasted write attempt.

**apps/web/src/pages/Home.tsx** -- replace the roomPesos tile with a
roomHonesty tile, same shape as the roomToday tile it sits next to.

## Copy

Replaces home.lostWeekLabel. New key, home.honestyLabel, something like
"Honest today" / "were honest today" -- short enough for a tile label,
needs the same five-locale pass every other Home string got this session.
home.togetherHint ("No names. Just the room.") still applies and does not
need to change.

## What this does NOT change

- The individual's own loss figures, anywhere they already show correctly
  (Progress, Journal, the journal intercept).
- public_stats/live.pesos / weekPesos() -- kept for now in case something
  else wants it later; not deleted as part of this, just no longer rendered
  on Home.
- Community moderation, video stats, or anything else built this session.

## Order of operations if picked up

Same order used for every other Cloud-Function-backed feature this session,
because the predeploy hook only fixed the *reason* deploys used to go
stale, not the requirement to sequence them:

1. Deploy the new function first (firebase deploy --only functions),
   confirm it shows as a fresh create, not folded into an unrelated update.
2. Deploy the rule.
3. Ship the client change.
4. Verify against production the same way the hearts fix was verified:
   trigger the write, reload, confirm the count survived server-side, not
   just in local state.
