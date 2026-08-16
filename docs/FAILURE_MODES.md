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

**Impact:** Cloud writes fail silently for signed-in users. Local-only users are unaffected. No data is destroyed — Firestore data from before the outage is intact.

**Recovery:** `firestoreAdapter` in `storage.ts` throws on write; Zustand stores catch the error. The user's local session continues normally. Data written during the outage is lost (not queued).

**Action:** Check [Firebase Status](https://status.firebase.google.com). Consider adding a write-failure toast in the next session.

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

**Response to user:** "Your data is stored on your device. Sign in to back it up and sync across devices — that is free. If you were never signed in, data from a cleared browser cannot be recovered."

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
