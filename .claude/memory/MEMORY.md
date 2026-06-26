# Reality Check — Memory Index

---

## Project State
- [Handoff](../../docs/HANDOFF_Latest.md) — latest session summary, pending items, stack overview

## Stack & Architecture
- Web: React 18 + Vite + Zustand + react-router v7 + Tailwind — `apps/web/`
- Mobile: Expo RN — `apps/mobile/` — port 8082
- Shared logic: `packages/core/` (types, calculations, milestones)
- Firebase: Auth + Firestore + Functions (asia-southeast1)
- Payments: PayMongo — GCash / Maya / QRPH / card — KYC done

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

## Next Session
- Fix Expo Go device connection (RC mobile port 8082)
- Grocery QR/barcode scanning
- Urge timer screen
- Onboarding 3-screen flow
