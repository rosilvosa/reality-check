# Community country filter — design

**Date:** 2026-08-15
**Status:** Approved

## Problem

Reality Check's Community feed has no country dimension. The app already collects a coarse region per user (Settings → Help Region: PH/US/UK/AU/SG/INTL, used today only to pick which Find Help content to show). Community posts don't carry it, so there's no way to see posts from people in the same country.

## Decisions

- Each post is tagged with the poster's country, snapshotted from their Settings → Help Region **at the moment they post** — not a live lookup. A post's country never changes retroactively if the poster later changes their settings; costs no extra read.
- Feed defaults to **all countries**; a selector narrows to one.
- Country values are exactly the existing `HelpRegion` type (`PH | US | UK | AU | SG | INTL`) — no new granularity.
- Country names reuse `HELP_REGIONS`' existing English labels unmodified (Settings' own region picker already leaves these untranslated across all 5 locales — same precedent).

## Data model

`community_posts/{id}` gets one new field: `country: HelpRegion`.

`firestore.rules`'s existing `community_posts` create rule gains one check, matching the strictness already applied to `type`/`text`:
```
&& request.resource.data.country in ['PH', 'US', 'UK', 'AU', 'SG', 'INTL']
```

## Client changes

- `CommunityPost` type (`apps/web/src/lib/community.ts`) gains `country: HelpRegion`.
- `createPost()` gains a `country: HelpRegion` parameter, read from `useSettingsStore().helpRegion` at call time in `Community.tsx`.
- `fetchPosts()` maps the new field through (default to `'PH'` if a legacy/malformed doc lacks it, matching `resolveHelpRegion`'s existing fallback).
- `Community.tsx`: a compact `<select>`-style country filter sits next to the existing type-filter pill row (not a second pill row, to avoid stacking two full rows). Filtering stays client-side over the same capped 80-post fetch — same pattern as the existing type filter, no new Firestore query.
- New i18n keys (5 locales): a label for the selector and an "All countries" option. Country names themselves are NOT translated (reusing `HELP_REGIONS`, matching Settings precedent).

## Privacy note

HelpRegion is coarse (6 broad regions, not city-level) and PH is the overwhelming majority of users, so a country tag shouldn't meaningfully erode the "anonymous, no names" framing of Community. Worth noting, not a blocker.

## Out of scope

- Filtering by anything more precise than the existing 6-value region.
- Retroactively backfilling `country` on posts created before this ships (old posts simply fall back to `'PH'` on read, per above).
- Any change to the existing type filter (Tips/Urge/Questions/Hard day) — it stays as-is, alongside the new country selector.
