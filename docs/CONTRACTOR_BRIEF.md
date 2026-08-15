# Reality Check — Contractor Brief (web launch only)

**Live:** https://reality-check-ph.web.app  
**Repo:** https://github.com/rosilvosa/reality-check (private)  
**Read first:** `README.md`, then this file, then `docs/ARCHITECTURE.md`  
**Stack:** React 18 + Vite + Zustand + Firebase (Auth, Firestore, Hosting). Functions stay in `asia-southeast1`.  
**Do not touch:** `apps/mobile`, Expo, stores, grocery scan, push, biometrics, SMS parser, community, widgets, Gut Check, Stripe, finishing PayMongo as a launch requirement

The web product is ~80% done. Local (no-account) use works. Cloud sync is scaffolded and **broken**. Money is donations (Ko-fi), not a Pro paywall.

---

## Goal

Anyone can use the app in a browser with no account.  
Anyone who **signs in** gets free cloud backup of journal, settings, streak, and barriers across devices.  
Settings already has a Ko-fi button. Keep it. Do not put a payment wall in front of sync. Donation copy must say gifts keep Reality Check running **and** fund an upcoming safety app. Do not invent a product name — leave it as “a safety app.”

---

## Locked Firestore schema

Document paths must have an even number of segments. Use this and nothing else:

```
users/{uid}/data/settings
users/{uid}/data/streak
users/{uid}/data/barriers       # string[] of completed barrier ids
users/{uid}/journal/{entryId}
```

Today’s code disagrees with itself and uses invalid 3-segment paths (`users/{uid}/subscription`, mobile `users/{uid}/settings`). Fix the **web** adapter, auth gate, and migration to the schema above.

Sync trigger: signed-in **non-anonymous** user. Not `isPro`. Not a paid flag.

If you leave the unused `subscription` doc / PayMongo functions in the tree, do not wire them into the launch path.

---

## In scope

1. **Cloud sync**
   - `apps/web/src/lib/storage.ts` — `getAdapter()` returns Firestore when the user is signed in (Google / email), localStorage otherwise
   - `apps/web/src/stores/authStore.ts` — drop Pro-as-sync-gate
   - `migrateToFirestore()` on first sign-in: settings, journal, **streak**, barriers
   - Reload stores after migrate. Progress “total saved” must not hard-read localStorage
   - Settings: “Sign in to sync” / “Cloud sync active”. Remove or hide the ₱299 Upgrade modal from the launch path. Keep the Ko-fi block.

2. **Rules**
   - Add `firestore.rules` and wire it in `firebase.json`
   - User can read/write only `users/{uid}/**`

3. **Launch pages**
   - `/privacy` and `/terms` (PH Data Privacy Act — journal is sensitive)
   - Account delete: wipe Firestore `users/{uid}` + localStorage keys (`rc_*`)

4. **Hardening**
   - Toast on Firestore write failure (see `docs/FAILURE_MODES.md`)
   - If Firestore is down, keep writing locally and say so. Do not pretend sync worked.

5. **Optional (do if time)**
   - Port mobile `UrgeTimerScreen` + `CallFriendScreen` to web
   - PWA manifest so Android can install to home screen
   - After a 7-day streak, a quiet Ko-fi prompt (not a modal on first open)

---

## Out of scope

- PayMongo E2E, Pro badges, ₱299 checkout. Code may stay. Do not spend launch time on it.
- Mobile app / store listing / native plugins
- Redesign, new features beyond the optional two
- Stripe

---

## Files to start with

| File | Why |
|---|---|
| `apps/web/src/lib/storage.ts` | Adapter + migration |
| `apps/web/src/stores/authStore.ts` | Stop gating on `isPro` |
| `apps/web/src/stores/streakStore.ts` | `getTotalSaved()` localStorage bug |
| `apps/web/src/pages/Settings.tsx` | Sign-in + Ko-fi; hide Upgrade |
| `apps/web/src/components/UpgradeModal.tsx` | Remove from launch path |
| `firebase.json` | Add rules deploy |
| `docs/ARCHITECTURE.md` | Why local-first + donations |

---

## Acceptance test

1. Logged out: journal + settings survive a refresh (this browser only).
2. Sign in with Google. Local data appears in Firestore under the schema above.
3. Refresh: still signed in, same journal / settings / streak. No Pro / paywall.
4. Other browser, same Google account: same data.
5. Failed write shows an error, not silent success. Local copy still usable.
6. Delete account: Firestore user tree gone, local `rc_*` keys gone.
7. Settings still has a working Ko-fi link. No ₱299 checkout in the main flow.

---

## Ops notes

- **Project ID stays** `reality-check-5fffe`. Public URL is Hosting site `reality-check-ph`.
- Functions region is **always** `asia-southeast1` if you touch functions at all.
- `functions/.env` and `apps/web/.env` are gitignored. Never commit them.
- Old URL `https://reality-check-5fffe.web.app` 301s to the live site.
- Auth authorized domains already include `reality-check-ph.web.app`.
