# Reality Check

A gambling recovery tool. It re-sensitizes you to the real value of money.

Casinos sell a digital illusion: chips, spins, “almost won.” This app breaks that. A loss is not a number on a screen. It is hours of your life, weeks of groceries, months of rent.

**Live:** https://reality-check-ph.web.app  
**Languages:** English, Filipino, Cebuano, Hiligaynon, Ilocano

The product is a website. On a phone, add it to the home screen from the browser. There is no store listing.

---

## What it does

| Tool | What it does |
|---|---|
| **I just lost** | One amount → hours of your life, groceries/rent, and a near-miss check if it felt close |
| **Journal** | Write the panic after a loss. Next time, you must re-read that entry before you can write again |
| **Trap** | Skinner box, house-edge math, why the game is built to keep you playing |
| **Barriers** | Checklist: self-exclusion, delete apps, block sites, cut payment methods, tell someone, helpline — numbers match the country in Settings |
| **Find Help** | Helplines, self-exclusion programs, and meetings for where you live |
| **Community** | Anonymous tips, urges, questions, and hard days |
| **Progress** | Daily check-in. Badges at 1, 3, 7, 14, 30, 60, 90, 180, 365 clean days |

No account required. Without sign-in, data stays in this browser. Sign in with Google or email if you want the same journal on another device. Sync is free. Nothing is locked behind a payment.

---

## Repo layout

```
apps/web          the product (React + Vite)
packages/core     shared types, calculations, i18n
functions         Cloud Functions (donations)
```

---

## Stack

- React 18, TypeScript, Vite, Zustand, react-router, Tailwind
- Firebase Auth, Firestore, Hosting

---

## License

MIT
