# Reality Check — Session Handoff

**Last updated:** 2026-06-26 - Session 2

---

## Completed This Session (Session 2 · 2026-06-26)

- Added taste-skill (13 design skills) to both RC and David's Beacon
- Copied all DB commands, hooks, plugins, audit plan to RC — both projects now in sync
- Added `typecheck` script to `apps/web/package.json`
- `.claude/settings.json` configured: Ponytail hook, typecheck on Edit/Write, graphify on Read, security-guidance plugin
- `docs/PRIVACY_SECURITY_AUDIT_PLAN.md` copied from DB
- All commands available: `/end-session`, `/deploy`, `/new-route`, `/new-store`, `/new-view`, `/new-function`, `/new-firestore-rule`, `/create-prd`, `/create-jtbd`, `/fix-github-issue`, `/update-handoff`, `/update-roadmap`
- Metro port 8082 confirmed for RC (DB uses 8081)
- `end-session` skill now global at `C:\Projects\.claude\commands\` + in RC repo

---

## Stack

- **Web:** React 18 + Vite + Zustand + react-router v7 + Tailwind CSS
- **Mobile:** Expo (React Native) — port 8082
- **Backend:** Firebase (Auth, Firestore, Cloud Functions — asia-southeast1)
- **Payments:** PayMongo (GCash, Maya, QRPH, card) — KYC done
- **Repo:** https://github.com/rosilvosa/reality-check (private)
- **Live:** https://reality-check-5fffe.web.app

---

## Pending / Next Session

- [ ] Fix Expo Go connection issue on device (test RC mobile)
- [ ] Onboarding flow (3 screens: welcome → income → assets) — mobile first
- [ ] Grocery scanning — QR/barcode scan, auto-fill name + price
- [ ] Urge timer screen (15-min countdown)
- [ ] "Call a Friend" accountability contacts
- [ ] Daily push notifications (streak reminder + pre-gambling intercept)
- [ ] Budget tracker — income vs spending vs losses dashboard
- [ ] Bank SMS parser — paste PH bank SMS, auto-extract loss amount
- [ ] Loss simulation — ₱X compounded in savings over 1/5/10 years
- [ ] Anonymous community feed
- [ ] Biometric lock (Face ID / fingerprint)
- [ ] Multi-language — Filipino + Cebuano
- [ ] Home screen widget (streak counter)
- [ ] Ko-fi button in Settings/footer
- [ ] ToS + Privacy Policy pages (required before any store submission)
- [ ] Open source after RN release (separate public repo)

---

## Firebase Project

- **Project ID:** reality-check-5fffe
- **Auth:** Anonymous + Google enabled
- **Functions:** asia-southeast1 — `createPaymongoCheckout` + `paymongoWebhook`
- **Firestore:** `users/{uid}/settings`, `users/{uid}/journal`, `users/{uid}/streak`, `users/{uid}/subscription`

---

## Dev Approach

Mobile-first: all new features built in Expo RN first, then ported to web app. PH → SEA → global expansion target.
