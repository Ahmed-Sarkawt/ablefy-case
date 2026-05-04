# Plan — Option 01 Prototype

> **Scope:** Targeted fix of the current onboarding flow, signup → course created.
> **Stack:** React 18 + TypeScript + Vite + Tailwind · Hono + better-sqlite3 · Vitest + Playwright
> **Goal:** Reduce Alex's time-to-value from 15+ minutes to under 5 minutes — without changing ablefy's underlying architecture.

## What we're building

A working prototype that demonstrates the redesigned onboarding flow. Users can:
- Sign up with the new minimal form
- Land on the redesigned dashboard
- Create a product through the simplified flow
- See the redesigned post-creation screen

All data persists in SQLite. The UI matches ablefy's design system token-for-token.

## What we are not building

- Course content builder (out of scope per audit)
- Community/foroom integration (Blocker 3, separate problem)
- Real Stripe/payment processing (we mock the payment step)
- Compliance/KYC backend (we mock the verification flow)
- Email sending (we log to console)

## The five fixes

This prototype demonstrates the five targeted improvements from the audit:

| # | Current behavior | New behavior | Issue resolved |
|---|------------------|--------------|----------------|
| 1 | Signup requires phone + shop name + 6-step business form | Signup is 3 fields. Business questions deferred (or removed). | #1, #3 |
| 2 | First dashboard shows 3 compliance warning banners | Compliance moved to a Settings → Compliance section. Dashboard shows one welcoming card with the primary action. | #2, #4 |
| 3 | Payment step shows 5 model tiles + 12 Advanced toggles | Payment defaults to one-time price. Single field: "What's your price?" Advanced is collapsed and unlocked post-publish. | #5 |
| 4 | Post-creation screen lists 4 next-action options at equal weight | Single primary action "Add Course Content". Three secondary actions tucked under a "More options" disclosure. | #9 |
| 5 | No contextual prompts in the product editor | "Add your first lesson" prompt visible when content tab is empty. | #10 |

## Architecture

```
prototype/
├── src/                 React app
│   ├── routes/          One file per screen in the flow
│   ├── components/      Shared UI primitives matching ablefy tokens
│   ├── hooks/           useAuth, useProduct, useFlow
│   ├── store/           Zustand store for flow state
│   ├── lib/             api.ts, db.ts (client-side helpers)
│   ├── styles/          tokens.css (design system as CSS vars)
│   └── types/           Shared types
├── server/              Hono API server (port 3001)
│   ├── db/              SQLite + schema + migrations
│   ├── routes/          REST endpoints
│   └── middleware/      validation, auth, error handling
└── tests/
    ├── unit/            Component-level Vitest
    ├── integration/     API route tests with in-memory DB
    └── e2e/             Playwright flow tests
```

The Vite dev server proxies `/api` to the Hono server on `:3001`. Both run with one command (`npm run dev`).

## Data model (SQLite)

See `prototype/server/db/schema.sql` for the actual schema. High level:

- `users(id, email, password_hash, name, created_at)`
- `products(id, user_id, name, description, cover_image_url, price_cents, currency, status, created_at, updated_at)`
- `lessons(id, product_id, title, position, content_md, created_at)` — schema present, not used in Option 01
- `onboarding_events(id, user_id, event_type, occurred_at)` — instrumentation for time-to-value measurement

## Animations & motion

We introduce **three** subtle, cross-browser animations:

1. **Stagger reveal** on the welcome dashboard cards (each card fades+slides in 50ms after the previous, max 4 cards). `transform: translateY(8px) → translateY(0)` + `opacity: 0 → 1` over 250ms.
2. **Modal scale-in** for the product creation flow. `transform: scale(0.96) → scale(1)` + `opacity: 0 → 1` over 200ms with `ease-out`.
3. **Success pulse** when the product is created. A single `transform: scale(1) → scale(1.03) → scale(1)` over 400ms on the success card, with the green checkmark drawing in via `stroke-dashoffset`.

All three respect `prefers-reduced-motion: reduce` (animations become instant or fade-only).

Motion primitives live in `prototype/src/lib/motion.ts` and `prototype/src/styles/animations.css`.

## Build phases

| Phase | What | Time estimate |
|-------|------|---------------|
| 1. Scaffold | Vite + Tailwind config, server skeleton, schema, design tokens, base components (Button, Input, Card) | 30 min |
| 2. Auth flow | Signup + login pages with new minimal form. Server endpoints. Tests. | 30 min |
| 3. Dashboard | Redesigned dashboard. Compliance moved to settings. Welcome card. | 25 min |
| 4. Product creation | Single-step product create flow with simplified payment. | 35 min |
| 5. Post-creation | Redesigned screen with primary action + collapsed secondary. | 15 min |
| 6. Polish | Animations, focus rings, empty states, contextual prompts. | 25 min |
| 7. E2E test | Full flow test measuring time-to-completion. | 15 min |
| **Total** | | **~3 hours** |

## Definition of done for the prototype

- [ ] `npm run dev` starts both frontend and server, opens to working signup
- [ ] Full flow signup → course created works end-to-end with persistence
- [ ] All tests pass: `npm run lint && npm run typecheck && npm test`
- [ ] E2E test for the full flow exists and measures time-to-completion
- [ ] Animations present and respect reduced-motion
- [ ] Tokens used consistently — no hex literals in components
- [ ] One screenshot per route saved to `prototype/public/screenshots/`
- [ ] Slide deck section 7 reflects the working prototype
- [ ] `docs/DECISIONS.md` updated with any deviations from this plan

## Open questions to validate during build

1. Do we need real password hashing (bcrypt) or is a mock fine for the demo? **Decision needed before phase 2.** Recommendation: use bcrypt, it's 5 minutes of work and looks better in a code review.
2. Should the cover image upload actually upload, or just accept a URL? Recommendation: URL only for the prototype, with a clear "Image library coming soon" affordance.
3. Do we instrument time-to-value in the prototype itself? Recommendation: yes — `onboarding_events` table makes this trivial and gives us a metric to put on the slide deck.
