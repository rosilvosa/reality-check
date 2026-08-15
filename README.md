# Reality Check

A gambling recovery tool. It re-sensitizes you to the real value of money.

Casinos sell a digital illusion: chips, spins, “almost won.” This app breaks that. A loss is not a number on a screen. It is hours of your life, weeks of groceries, months of rent.

**Live:** https://reality-check-ph.web.app  
**Source:** https://github.com/rosilvosa/reality-check  
**Languages:** English, Filipino, Cebuano, Hiligaynon, Ilocano

The product is a website. On a phone it can install as a PWA (Add to Home Screen). There is no store app.

---

## What it does

| Tool | What it does |
|---|---|
| **Sweat Hours** | Convert a loss into hours and days of your life you will not get back |
| **Asset Reality** | Same loss, in groceries / rent / medicine / whatever you actually pay for |
| **Journal** | Write the panic after a loss. Next time, you must re-read that entry before you can write again |
| **Near-miss** | A near-miss is a 100% financial loss dressed up as hope |
| **Trap** | Skinner box, house-edge math, why the game is built to keep you playing |
| **Barriers** | Checklist: self-exclusion, delete apps, block sites, cut payment methods, tell someone, helpline — numbers match the country in Settings |
| **Find Help** | Helplines, self-exclusion programs, and meetings for where you live |
| **Community** | Anonymous tips, wins, questions, and hard days |
| **Progress** | Daily check-in. Badges at 1, 3, 7, 14, 30, 60, 90, 180, 365 clean days |

No account required. Without sign-in, data stays in this browser. Sign in with Google or email if you want the same journal on another device. Sync is free. Nothing in the app is locked behind a payment.

If Reality Check helped you, the useful thing is not paying for this app. It is telling a special-needs family about [David's Beacon](https://davidsbeacon.com). That page lives at `/mission`.

---

## Repo layout

```
apps/web          the product (React + Vite)
apps/mobile       Expo scaffold, not the live product
packages/core     shared types, calculations, i18n
functions         optional Cloud Functions
docs/             architecture, setup, failure modes
```

---

## Stack

- Web: React 18, TypeScript, Vite, Zustand, react-router v7, Tailwind
- Backend: Firebase Auth, Firestore, Hosting
- Functions region: `asia-southeast1`

---

## Develop

Need Node 20+ and `firebase-tools`.

```bash
git clone https://github.com/rosilvosa/reality-check.git
cd reality-check
npm install
cd apps/web && npm install && cd ../..
```

Web env: copy `apps/web/.env.example` → `apps/web/.env` and fill Firebase web config.

```bash
npm run web          # http://localhost:5173
```

### Deploy

```bash
npm run build:web
firebase deploy --only hosting
```

See [`docs/SETUP.md`](docs/SETUP.md) for env vars and console setup.

---

## Docs

| File | What |
|---|---|
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Why each stack choice |
| [`docs/SETUP.md`](docs/SETUP.md) | Env vars, Firebase console, gotchas |
| [`docs/FAILURE_MODES.md`](docs/FAILURE_MODES.md) | What breaks and how to recover |

---

## License

MIT
