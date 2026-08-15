# Architecture Decisions

Every decision here answers WHY, not WHAT. The code answers what.

---

## React + Vite over Next.js

Reality Check is a client-side personal tool — no SEO requirements, no server-rendered pages, no dynamic routing that benefits from SSR. Next.js adds complexity (server components, hydration, edge config) with zero benefit for a single-user recovery app. Vite's dev server is faster, the build output is static HTML/JS/CSS that deploys to Firebase Hosting in one command, and there's no runtime server to manage or pay for.

---

## Firebase over a custom backend

Firebase was chosen for consolidation, not convenience. All projects under this umbrella (David's Beacon, Reality Check) share a Google Cloud billing account and the same mental model. Firebase gives Auth, Firestore, Cloud Functions, and Hosting in a single console — no separate auth service, no separate database, no separate hosting bill. The tradeoff is vendor lock-in, which is acceptable given the project scale and the cost of running your own infra at this stage.

---

## Zustand over Redux or React Context

Redux introduces action creators, reducers, and boilerplate that don't pay off until a team of 5+ people need to trace state changes across a large app. React Context re-renders too aggressively for stores that change frequently (journal entries, streak state). Zustand gives a simple `create()` API with selector-based subscriptions, runs identically on web and React Native (with an AsyncStorage adapter swap), and requires no Provider wrapping. It's the least infrastructure for the most result.

---

## Two storage adapters (localStorage vs Firestore)

The psychological design goal requires zero friction at the moment of crisis — a user reaching for this app after a loss cannot hit a signup wall. The `StorageAdapter` interface (`storage.ts`) abstracts all reads and writes. Free tier uses `localStorageAdapter`; Pro tier uses `firestoreAdapter`. The calling code (Zustand stores) never knows which one it's talking to. When a user upgrades, `migrateToFirestore()` copies their local data to Firestore and clears localStorage — one function call, no UI changes needed.

---

## Anonymous auth first

Firebase anonymous auth creates a real UID without requiring email, password, or social login. This means Firestore security rules can still scope data to `users/{uid}` even for free users — the data model is consistent. When a user upgrades and signs in with Google, Firebase links the anonymous account to the real account, preserving the UID and all Firestore data. Forcing sign-in at launch would lose users who need the app most.

---

## PayMongo over Stripe

Stripe is the global default but it's optimized for card-first markets. The Philippines is GCash-first. PayMongo is a PH-native gateway with direct GCash, Maya, GrabPay, and QRPH (instant QR bank transfer) integrations. Getting a Philippine user to enter a 16-digit card number is a conversion killer. Getting them to tap GCash is not. PayMongo's API is also well-documented, its webhook flow is straightforward, and KYC approval is faster for PH-registered businesses.

---

## Donations over a paywall

A subscription on a gambling recovery tool is contradictory — it reintroduces a recurring charge to someone trying to stop spending. A one-time ₱299 Pro fee for cloud backup is better than a subscription, and PayMongo is still in the repo if we ever need it.

It is still the wrong lock. The journal is the intercept. The person most likely to lose a phone or switch devices is the person in a binge. Gating that backup behind payment punishes the user who needs the product most.

Launch rule: local-first with no account, free cloud sync on sign-in, Ko-fi donations to keep Firebase on and to fund an upcoming safety app. If donation volume ever fails to cover Blaze-plan cost at real scale, an optional Supporter thank-you can come back. Sync itself stays free.

---

## Cloud Functions in Singapore (asia-southeast1)

The Philippines has no GCP region. The two closest are Singapore (asia-southeast1, ~20ms) and Taiwan (asia-east1, ~40ms). Singapore is the standard choice for PH-hosted workloads. The PayMongo webhook must process fast enough that the response lands before PayMongo's timeout — using us-central1 (the Firebase default) adds ~200ms of unnecessary round-trip latency and has caused webhook failures in testing. All functions must deploy to asia-southeast1; the Firebase default region must never be used for this project.

---

## Monorepo (apps/web + apps/mobile + packages/core)

`packages/core` holds types, calculation logic, and milestone configuration — code that must behave identically on web and mobile. Without a monorepo, this logic would be duplicated and drift over time (a bug fixed on web would be missed on mobile). The monorepo uses npm workspaces; Metro (Expo's bundler) resolves `@rc/core` via `metro.config.js`'s `extraNodeModules`. The tradeoff is slightly more complex install steps, which are documented in SETUP.md.

---

## Expo over bare React Native

Bare React Native requires Xcode on macOS to build for iOS and Android Studio for Android. EAS Build (Expo's cloud build service) removes both requirements — builds happen in the cloud. OTA updates via Expo allow JS/asset changes to reach users without going through Play Store review (7-day average wait). Expo plugins handle camera, barcode scanning, biometrics, and push notifications without writing a line of native Java or Swift. The only scenario where bare RN wins is custom native modules — this app has none.

---

## Mobile-first development

New features are built in the Expo app first, then ported to the web app. The reasoning is constraint-driven: a 5-inch screen with no keyboard forces you to decide what actually matters in a UI. Features that feel optional on desktop become obviously unnecessary on mobile. The reverse — designing for desktop first and shrinking — produces cramped mobile UIs and delayed mobile releases. The PH market is also Android-dominant; the majority of users will first encounter this app on a phone, not a browser.
