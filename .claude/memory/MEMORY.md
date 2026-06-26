# Reality Check — Memory Index

---

## Project State
- [Handoff](../../docs/HANDOFF_Latest.md) — latest session summary, pending items, stack overview

## Stack & Architecture
- Web: React 18 + Vite + Zustand + react-router v7 + Tailwind — `apps/web/`
- Mobile: Expo RN — `apps/mobile/` — port 8082 (DB uses 8081)
- Shared logic: `packages/core/` (types, calculations, milestones)
- Firebase: Auth + Firestore + Cloud Functions (asia-southeast1)
- Payments: PayMongo — GCash / Maya / QRPH / card — KYC done
- Live: https://reality-check-5fffe.web.app

## Firestore Schema
```
users/{uid}/
  settings: { monthlyPay, hoursPerMonth, assets: [{name, cost}] }
  journal/{docId}: { amount, text, createdAt }
  streak: { currentStreak, longestStreak, lastCheckInDate, milestonesSeen, startDate }
  subscription: { isPro, paidAt, amount }
```

## Dev Rules
- Mobile-first: build in Expo RN first, port to web after
- Free tier: localStorage / AsyncStorage
- Pro tier (₱299 one-time): Firestore cloud sync
- All functions deploy to asia-southeast1 (Singapore)
- typecheck runs automatically on every Edit/Write via hook

## Available Commands
`/end-session` `/deploy` `/new-route` `/new-store` `/new-view` `/new-function`
`/new-firestore-rule` `/create-prd` `/create-jtbd` `/fix-github-issue`
`/update-handoff` `/update-roadmap`

## Next Session
- Fix Expo Go device connection (RC mobile port 8082)
- Grocery QR/barcode scanning
- Urge timer screen
- Onboarding 3-screen flow (welcome → income → assets)
