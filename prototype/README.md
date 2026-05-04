# prototype branch

Working implementation of the ablefy onboarding redesign — signup through first product published.

---

## Quick start

```bash
npm install
npm run dev          # frontend :5173 + API :3001 (proxied)
```

Demo reset (clears all session state, navigates to fresh signup):

```
http://localhost:5173/demo-reset
```

---

## Stack

| Layer | What |
|-------|------|
| Frontend | React 19 · TypeScript strict · Vite · Tailwind CSS |
| Backend | Hono · better-sqlite3 (SQLite) · bcrypt |
| Auth | HTTP-only session cookie + localStorage cache |
| Tests | Vitest + React Testing Library (unit) · Playwright (e2e) |

---

## Flow implemented

```
/signup
  ↓
/dashboard  (onboarding modal on first visit)
  ↓  Skip or complete inline product wizard
/dashboard  (step tracker: Create → Content → Sell → Get paid)
  ↓  Add item → lesson in Content tab → step 2 done
/dashboard  (step 3 active: "You're ready to go live")
  ↓  Publish product
/dashboard  (product is Live)
```

Demo reset → `/demo-reset` clears localStorage flags and session, redirects to `/signup`.

---

## Project structure

```
src/
├── routes/          One file per route (Dashboard, ProductDetail, ProductsList, …)
├── components/      Shared UI (CabinetShell, SetupSteps, Button, Card, …)
├── lib/             auth, api, motion, events
└── styles/          tokens.css (design tokens), animations.css, index.css

server/
├── app.ts           Hono factory
├── routes/          auth, products, events
└── db/              schema.sql, migrate.ts, index.ts
```

---

## Scripts

```bash
npm run dev          # dev server
npm run build        # production build
npm run typecheck    # tsc --noEmit
npm run lint         # eslint
npm test             # vitest (watch)
npm test -- --run    # vitest (CI mode)
```

---

## CI

GitHub Actions runs `typecheck → lint → test` on every push to this branch.  
See [`.github/workflows/prototype-ci.yml`](../.github/workflows/prototype-ci.yml).

---

*Design tokens and component specs: `data` branch → `docs/DESIGN-SYSTEM.md`*  
*Flow spec: `data` branch → `docs/FLOW.md`*
