# Local Setup Guide

This is the guide that actually works. Every command, every env var, every gotcha that bit us once.

---

## Prerequisites

- **Node.js 20+** — check with `node --version`. Functions will reject Node 18 (decommissioned Oct 2025).
- **npm** — comes with Node. pnpm also works but npm is what's tested.
- **Firebase CLI** — `npm install -g firebase-tools` then `firebase login`
- **Android device** — with [Expo Go](https://expo.dev/go) installed (for mobile dev)
- **Git**

---

## Clone and Install

```bash
git clone https://github.com/rosilvosa/reality-check.git
cd reality-check

# Root workspace
npm install

# Web app
cd apps/web && npm install && cd ../..

# Mobile app
cd apps/mobile && npm install && cd ../..

# Cloud Functions
cd functions && npm install && cd ..
```

---

## Environment Variables

**Never commit `.env` files.** They are gitignored at root, `apps/web/`, `apps/mobile/`, and `functions/`.

### Web app — `apps/web/.env`

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_APP_URL=http://localhost:5173
```

### Mobile app — `apps/mobile/.env`

```env
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
```

### Cloud Functions — `functions/.env`

```env
PAYMONGO_SECRET_KEY=sk_live_...
PAYMONGO_WEBHOOK_SECRET=whsec_...
APP_URL=https://reality-check-5fffe.web.app
```

> For local testing: use `sk_test_...` keys from PayMongo Dashboard → Developers → API Keys. Test mode doesn't charge real money.

Get Firebase values from: [Firebase Console](https://console.firebase.google.com) → Project Settings → Your apps → Web app → SDK config.

---

## Firebase Console Setup (one-time)

1. Create project at console.firebase.google.com
2. **Authentication** → Sign-in methods → Enable **Anonymous** and **Google**
3. **Firestore** → Create database → Start in **production mode** → Region: `asia-southeast1`
4. **Project Settings** → Add web app → Copy config to `apps/web/.env`
5. **Firestore** → Rules → Paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

6. Upgrade to **Blaze plan** (required to deploy Cloud Functions — free tier limits still apply)

---

## Running Locally

### Web app

```bash
cd apps/web
npm run dev
# Opens at http://localhost:5173
```

### Mobile app

```bash
cd apps/mobile
npm run start
# Starts Metro on port 8082
# Scan the QR code with Expo Go on your Android device
```

> **Port note:** David's Beacon mobile uses port **8081**. Reality Check uses **8082**. Both can run simultaneously — scan the correct QR from the correct terminal.

### Cloud Functions (local emulator)

```bash
firebase emulators:start --only functions
```

---

## Build and Deploy

```bash
# 1. Build web app
cd apps/web
npm run build
cd ../..

# 2. Build functions (required before deploy)
cd functions
npm run build
cd ..

# 3. Deploy everything
firebase deploy

# Or selectively:
firebase deploy --only hosting
firebase deploy --only functions
```

---

## Gotchas

**`@rc/core` not resolving in Expo Metro**
`apps/mobile/metro.config.js` maps `@rc/core` to `packages/core` via `extraNodeModules`. If Metro still can't find it:
```bash
npx expo start --port 8082 --clear
```
The `--clear` flag resets the Metro bundle cache.

**Expo Go opens David's Beacon instead of Reality Check**
Both projects use Expo Go. Each runs on a different port (RC: 8082, DB: 8081). Make sure you're scanning the QR from the RC terminal window, not the DB one. If confused, kill both and restart RC only.

**Firebase Functions Node version**
`functions/package.json` locks engines to Node 20. Do not change to 22 without testing — Firebase function runtimes lag behind Node releases.

**PayMongo webhook URL must use Singapore region**
```
https://asia-southeast1-reality-check-5fffe.cloudfunctions.net/paymongoWebhook
```
Using the Firebase default `us-central1` URL will route to a non-existent function and silently fail webhooks.

**`functions.config()` is deprecated — do not use it**
All env vars for Cloud Functions live in `functions/.env`. The old `firebase functions:config:set` commands no longer work (deprecated March 2027). Any documentation or Stack Overflow answer suggesting `functions.config()` is outdated.

**TypeScript must be compiled before deploy**
`firebase deploy --only functions` reads from `functions/lib/` (compiled output), not `functions/src/`. If `functions/lib/index.js` doesn't exist, the deploy fails. Always run `cd functions && npm run build` first.

**PowerShell doesn't support `&&`**
On Windows PowerShell, `npm run build && firebase deploy` throws a parser error. Run commands separately:
```powershell
npm run build
firebase deploy
```

---

## TypeScript Check

```bash
cd apps/web
npm run typecheck   # runs tsc --noEmit
```

This runs automatically on every file edit via the `.claude/settings.json` hook.
