# Reality Check

A gambling recovery tool for the Philippines. It re-sensitizes you to the real value of money.

Casinos sell a digital illusion: chips, spins, “almost won.” This app breaks that. A loss is not a number on a screen. It is hours of your life, weeks of groceries, months of rent.

**Live:** https://reality-check-ph.web.app  
**Languages:** English, Filipino, Cebuano, Hiligaynon, Ilocano

The web app is the product. There is no App Store / Play Store release. Add it to your phone home screen from the browser.

---

## What works today

| Tool | What it does |
|---|---|
| **Sweat Hours** | Convert a loss into hours and days of your life you will not get back |
| **Asset Reality** | Same loss, in groceries / rent / medicine / whatever you actually pay for |
| **Journal** | Write the panic after a loss. Next time, you must re-read that entry before you can write again |
| **Near-miss** | A near-miss is a 100% financial loss dressed up as hope |
| **Trap** | Skinner box, house-edge math, why the game is built to keep you playing |
| **Barriers** | Checklist: self-exclusion, delete apps, block sites, cut payment methods, tell someone, helpline |
| **Progress** | Daily check-in. Badges at 1, 3, 7, 14, 30, 60, 90, 180, 365 clean days |
| **Onboarding** | 3 screens: welcome → income → the real costs in your life |

Free use needs no account. Data stays in this browser (`localStorage`). Nothing is uploaded.

---

## Cloud sync (the remaining job)

Sign in with Google (or email). Your journal, settings, streak, and barriers copy to Firestore and follow you to every device.

**Sync is free.** It is not a Pro upsell.

Why: the journal is the intercept. The person most likely to lose a phone, clear a browser, or open this on a second device is the person in a binge. Charging them ₱299 to keep that record is the wrong product.

**Status:** the UI, adapters, and Firebase project exist. The wiring is broken (invalid Firestore paths, checkout pointed at the wrong Functions region, web vs mobile schemas disagree). A contractor finishes this. See [`docs/CONTRACTOR_BRIEF.md`](docs/CONTRACTOR_BRIEF.md).

How it should work after that job:

1. Use the app with no account. Everything stays on this device.
2. Sign in. Local data migrates to `users/{uid}/…` and then reads/writes go to the cloud.
3. Same Google account on another browser or phone → same journal, settings, streak.
4. Delete account wipes Firestore + local `rc_*` keys.

---

## How this stays alive (donations, not a paywall)

This is a recovery tool for people who already have a money problem. A subscription is out. A paywall on backup is out.

**Money path: donations.** Ko-fi is already in Settings: https://ko-fi.com/rosilvosa

Donations keep Reality Check online **and** fund a safety app that will be released soon. Say that in the Settings copy (already wired in all five languages). After a 7-day streak, a quiet follow-up is enough:

> This tool is free because people who used it kept it alive. A coffee here also builds the safety app. Send what one spin used to cost you — or nothing.

That covers Firebase, some of your time, and the next project. A clear “this funds the next thing” ask beats a feature lock that makes the product feel like another extractor.

PayMongo (₱299 Pro) is still in the repo and KYC is done. Leave it dormant. If donations never cover Blaze-plan costs at real scale, turn it on later as an optional **Supporter** thank-you — never as a lock on journal backup.

Do not add Stripe.

---

## Repo layout

```
apps/web          ← the product (React + Vite). Deploy this.
apps/mobile       ← Expo scaffold. Frozen. Do not work here.
packages/core     ← shared types, calculations, i18n
functions         ← PayMongo (parked) + future server hooks
docs/             ← architecture, setup, failure modes, contractor brief
```

---

## Stack

- Web: React 18, TypeScript, Vite, Zustand, react-router v7, Tailwind
- Backend: Firebase Auth (anonymous + Google), Firestore, Hosting
- Functions: `asia-southeast1` only (never `us-central1`)
- Payments (parked): PayMongo
- Donations: Ko-fi

**Firebase project ID** (cannot change): `reality-check-5fffe`  
**Public site:** `reality-check-ph` → https://reality-check-ph.web.app  
**Old URL** https://reality-check-5fffe.web.app 301s to the public site.

---

## Develop

Need Node 20+ and `firebase-tools`.

```bash
git clone https://github.com/rosilvosa/reality-check.git
cd reality-check
npm install
cd apps/web && npm install && cd ../..
cd functions && npm install && cd ..
```

Web env: copy `apps/web/.env.example` → `apps/web/.env` and fill Firebase web config.

```bash
npm run web          # http://localhost:5173
```

Do not run mobile unless you were asked to. Metro is port **8082** if you ever do.

### Deploy (web)

```bash
cd apps/web
npm run build
cd ../..
firebase deploy --only hosting
```

Hosting deploys both the public site and the legacy redirect. Functions only need a deploy if you change `functions/`.

---

## Docs

| File | What |
|---|---|
| [`docs/CONTRACTOR_BRIEF.md`](docs/CONTRACTOR_BRIEF.md) | Outsource brief: scope, schema, acceptance test |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Why each stack choice |
| [`docs/SETUP.md`](docs/SETUP.md) | Env vars, Firebase console, gotchas |
| [`docs/FAILURE_MODES.md`](docs/FAILURE_MODES.md) | What breaks and how to recover |
| [`docs/HANDOFF_Latest.md`](docs/HANDOFF_Latest.md) | Session notes |

---

## Out of scope (do not build)

App Store / Play Store, Expo features (camera, push, biometrics, widgets), grocery barcode scan, bank SMS parser, community feed, Gut Check (separate product).

---

## License

MIT
