# Reality Check — Session Handoff

**Last updated:** 2026-06-26 - Session 1

---

## Completed This Session (Session 1 · 2026-06-26)

- Scaffolded React + Vite + Zustand + Firebase + Tailwind web app
- Built all 5 core modules: Sweat Hours, Asset Reality, Journal (with intercept), Near-Miss Reframe, Progress/Streaks
- Firebase Auth (anonymous + Google) + Firestore cloud sync
- PayMongo one-time payment (₱299) — GCash, Maya, QRPH, card
- Firebase Cloud Functions deployed to Singapore (asia-southeast1)
- Milestone modal system (Day 1/3/7/14/30/60/90/180/365)
- Deployed to Firebase Hosting: https://reality-check-5fffe.web.app
- Monorepo restructured: `apps/web/`, `apps/mobile/`, `packages/core/`
- Expo mobile app scaffolded with all screens + onboarding + urge timer + call friend
- Metro port locked to 8082 (DB uses 8081)
- `end-session` command added to repo

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
- [ ] Anonymous community feed
- [ ] Biometric lock (Face ID / fingerprint)
- [ ] Multi-language — Filipino + Cebuano
- [ ] Home screen widget (streak counter)
- [ ] Ko-fi button in Settings/footer
- [ ] ToS + Privacy Policy pages (required before any store submission)
- [ ] Loss simulation — ₱X compounded in savings over 1/5/10 years
- [ ] Open source after RN release (separate public repo)

---

## Firebase Project

- **Project ID:** reality-check-5fffe
- **Auth:** Anonymous + Google enabled
- **Functions:** asia-southeast1 — `createPaymongoCheckout` + `paymongoWebhook`
- **Firestore:** `users/{uid}/settings`, `users/{uid}/journal`, `users/{uid}/streak`, `users/{uid}/subscription`

---

## Dev Approach

Mobile-first: all new features built in Expo RN first, then ported to web app.
