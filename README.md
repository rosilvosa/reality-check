# Reality Check

A gambling addiction recovery tool designed to re-sensitize your brain to the real value of money.

The core psychological mechanism: break the "digital money illusion" by forcing you to confront what losses actually cost in hours of your life, weeks of groceries, and months of rent.

**Live app:** https://reality-check-5fffe.web.app

---

## Features

### 💧 Sweat Hours Calculator
Enter a gambling loss. Get back the number of hours of your life you will never recover. Not dollars — hours. Days. Real time.

### 🔥 Asset Reality Converter
Configure the cost of real things in your life — groceries, rent, medicine, utilities. Every loss is converted into those things. You didn't lose ₱5,000. You burned 3 weeks of groceries.

### 📓 Raw Emotion Journal
A loss journal locked to the moment after a loss. Write the panic, the shame, the physical feeling in your chest. The next time you open the journal, you are forced to read your last entry before you can write anything new. This is the intercept.

### ⚠️ Near-Miss Reframe
The near-miss is a casino's most powerful weapon. This section exists to dismantle it every time. You describe what happened. The app tells you the truth: a near-miss is a 100% financial loss dressed up as hope.

### 🏆 Progress & Streaks
Daily check-in to track clean days. Milestone badges at 1, 3, 7, 14, 30, 60, 90, 180, and 365 days. Each milestone shows your personalized savings — the real money you protected by not gambling.

---

## Privacy

By default, all data is stored locally on your device (localStorage). Nothing leaves your browser.

Upgrade to **Pro** (₱299 one-time) to enable cloud sync across devices via Firebase Firestore. Your data is scoped to your user account and protected by Firestore security rules.

---

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Routing:** react-router v7
- **State:** Zustand
- **Backend:** Firebase (Auth, Firestore, Cloud Functions)
- **Payments:** PayMongo (GCash, Maya, QRPH, card)
- **Styling:** Tailwind CSS
- **Hosting:** Firebase Hosting

---

## Development Setup

### Prerequisites
- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- A Firebase project with Firestore + Anonymous Auth enabled

### Install

```bash
git clone https://github.com/rosilvosa/reality-check.git
cd reality-check
npm install
cd functions && npm install && cd ..
```

### Configure

```bash
cp .env.example .env
```

Fill in your Firebase config values in `.env`.

For Cloud Functions, create `functions/.env`:

```
PAYMONGO_SECRET_KEY=sk_live_...
PAYMONGO_WEBHOOK_SECRET=whsec_...
APP_URL=https://your-app.web.app
```

### Run locally

```bash
npm run dev
```

### Deploy

```bash
npm run build
firebase deploy
```

---

## PayMongo Webhook

Set up a webhook in your PayMongo dashboard pointing to:

```
https://asia-southeast1-YOUR_PROJECT_ID.cloudfunctions.net/paymongoWebhook
```

Event: `checkout.session.payment.paid`

---

## Firestore Security Rules

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

---

## License

MIT
