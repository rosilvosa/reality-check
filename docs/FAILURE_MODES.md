# Failure Modes

What breaks, why it breaks, and what to do. You do not need this document when things work.

---

## Firebase Auth down

**Symptom:** Sign-in modal shows error. Anonymous auth fails silently on first load.

**Impact:** Free users are unaffected — localStorage works without any auth. Pro users cannot sync new data until auth recovers.

**Recovery:** `src/lib/firebase.ts` initializes auth on load. If anonymous sign-in fails, `getAdapter()` in `storage.ts` falls back to the localStorage adapter — no data is lost, the app keeps working locally.

**Action:** Check [Firebase Status](https://status.firebase.google.com). No code change needed. Wait for recovery.

---

## Firestore down

**Symptom:** Pro users' writes don't persist across devices. No visible error in current UI (known gap — toast on write failure not yet implemented).

**Impact:** Pro tier data writes fail silently. Free tier unaffected. No data is destroyed — Firestore data from before the outage is intact.

**Recovery:** `firestoreAdapter` in `storage.ts` throws on write; Zustand stores catch the error. The user's local session continues normally. Data written during the outage is lost (not queued).

**Action:** Check [Firebase Status](https://status.firebase.google.com). Consider adding a write-failure toast in the next session.

---

## PayMongo API down

**Symptom:** Clicking "Upgrade to Pro" shows a spinner, then an error. No charge occurs.

**Impact:** No new Pro upgrades can process. Existing Pro users are completely unaffected.

**Recovery:** `createCheckoutSession()` in `paymongo.ts` calls the `createPaymongoCheckout` Cloud Function, which POSTs to PayMongo's API. If PayMongo is down, the Cloud Function returns an error that surfaces in the `UpgradeModal`. PayMongo handles checkout atomically — no partial charges are possible.

**Action:** Check [PayMongo Status](https://status.paymongo.com). No rollback needed. Retry works once PayMongo recovers.

---

## PayMongo webhook fails (user paid but didn't get Pro access)

**Symptom:** User reports paying via GCash/Maya but the app still shows Free tier.

**Impact:** User is charged but `users/{uid}/subscription.isPro` was never set to `true` in Firestore.

**Recovery (manual):**
1. PayMongo Dashboard → Developers → Webhooks → find the checkout session → **Retry**
2. Or: Firebase Console → Firestore → `users/{uid}/subscription` → manually set `{ isPro: true, paidAt: <timestamp>, amount: 29900 }`

**Prevention:** PayMongo automatically retries webhooks 3 times with exponential backoff. Check Cloud Function logs: Firebase Console → Functions → `paymongoWebhook` → Logs.

**Root cause to investigate:** If webhooks fail consistently, check that `PAYMONGO_WEBHOOK_SECRET` in `functions/.env` matches the signing secret in PayMongo Dashboard exactly. A mismatch causes signature verification to reject all webhooks silently.

---

## Cloud Functions cold start (checkout is slow)

**Symptom:** First PayMongo checkout after a period of inactivity takes 3–8 seconds.

**Impact:** UX delay only. No data or payment impact. Subsequent checkouts in the same session are fast.

**Recovery:** Expected behavior for Gen 1 Cloud Functions with no minimum instances configured. Acceptable at current user scale.

**Future fix:** If checkout latency complaints increase, upgrade to Gen 2 functions with `minInstances: 1` — keeps one instance warm at all times (~$1.50/month).

---

## Metro bundler port conflict

**Symptom:** `npx expo start --port 8082` fails with `Error: listen EADDRINUSE: address already in use :::8082`.

**Recovery:**
```bash
npx kill-port 8082
npx expo start --port 8082
```
Or temporarily use a different port: `npx expo start --port 8083`.

---

## `@rc/core` not found in Expo

**Symptom:** Red error screen in Expo Go: `Cannot find module '@rc/core'` or `Module not found`.

**Recovery:**
```bash
npx expo start --port 8082 --clear
```
`--clear` resets the Metro bundle cache. This fixes ~90% of module resolution issues.

If it persists, verify `apps/mobile/metro.config.js` contains:
```js
config.resolver.extraNodeModules = {
  '@rc/core': path.resolve(workspaceRoot, 'packages/core'),
};
```

---

## Deploy fails: `functions/lib/index.js does not exist`

**Symptom:**
```
Error: There was an error reading functions/package.json:
functions/lib/index.js does not exist, can't deploy Cloud Functions
```

**Cause:** TypeScript source in `functions/src/` was not compiled before deploy.

**Recovery:**
```bash
cd functions
npm run build
cd ..
firebase deploy
```

**Prevention:** Always build functions before deploying. The `npm run build` in `functions/` compiles TypeScript to `functions/lib/`.

---

## Vite build chunk size warning

**Symptom:**
```
(!) Some chunks are larger than 500 kB after minification.
```

**Impact:** Warning only — not an error. Build succeeds. The large chunk is the Firebase SDK bundled together.

**Recovery:** Ignore for now.

**Future fix:** Add `manualChunks` to `vite.config.ts` to split Firebase into its own chunk:
```ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions'],
      },
    },
  },
}
```

---

## User data missing after device change (Free tier)

**Symptom:** User switches phones and their journal, settings, and streak are gone.

**Cause:** Free tier stores data in `localStorage` / `AsyncStorage` — device-local, not synced.

**This is by design.** Free tier = local only. Cloud sync requires Pro (₱299 one-time).

**Response to user:** "Your data is stored on your device. To back up and sync across devices, upgrade to Pro. If you haven't upgraded, your previous data cannot be recovered."

---

## Google sign-in fails on web

**Symptom:** Clicking "Sign in with Google" opens a popup that closes immediately or shows an error.

**Common causes:**
1. Google sign-in not enabled in Firebase Console → Authentication → Sign-in methods
2. The domain (`localhost` or production URL) not added to Firebase → Authentication → Settings → Authorized domains
3. Popup blocked by browser

**Recovery:**
1. Enable Google in Firebase Console
2. Add `localhost` and `reality-check-ph.web.app` to authorized domains
3. Tell user to allow popups for the site
