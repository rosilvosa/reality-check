# Reality Check — Session Handoff

**Last updated:** 2026-08-14

---

## Completed This Session (2026-08-14)

- Public URL is now **https://reality-check-ph.web.app** (Firebase Hosting site `reality-check-ph` on project `reality-check-5fffe`)
- `reality-check.web.app` is taken globally — cannot use it
- Legacy `https://reality-check-5fffe.web.app` 301s to the new site
- Auth authorized domains include `reality-check-ph.web.app`
- `functions/.env` `APP_URL` pointed at the new domain
- Contractor brief written: `docs/CONTRACTOR_BRIEF.md`
- **Shipped 2026-08-14:** free cloud sync on sign-in, PayMongo donations (₱50/100/299 + custom), Privacy/Terms, account delete. Live: https://reality-check-ph.web.app
- Community post copy: `docs/LAUNCH_POST.md`

---

## Completed This Session (Session 3 · 2026-06-26)

**Session focus: Gut Check — new trading journal app planning**

- Named new app **Gut Check** (double meaning: honest self-assessment + gut trade = impulsive trade, the enemy)
- Decided on Chrome extension-first architecture (not mobile-first — trading happens on desktop)
- Stack confirmed: Chrome extension (Manifest V3) + React web dashboard (PWA) + Firebase + NO separate RN (mobile use case is light; RC + DB already eating RN bandwidth)
- Extension scrapes both Tradovate and TopstepX; hybrid auto-fill + user emotion/notes
- Key features: pre-trade checklist, circuit breakers (cooldown timers, session lockout), consistency score, rule builder
- Gut Check is a separate app from Reality Check (different audience, different identity)
- Architecture section presented and accepted; design session paused — user switching to Zed IDE

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
- **Live:** https://reality-check-ph.web.app
- **Legacy URL:** https://reality-check-5fffe.web.app (301 → live)
- **Project ID (unchanged):** reality-check-5fffe
- **Contractor brief:** `docs/CONTRACTOR_BRIEF.md`

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
