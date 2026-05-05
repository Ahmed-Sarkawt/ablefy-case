---
marp: true
theme: default
class: lead
paginate: true
html: true
backgroundColor: '#fafafc'
color: '#21282e'
style: |
  section { font-family: 'Inter', sans-serif; }
  h1, h2, h3 { color: #21282e; font-weight: 600; }
  strong { color: #05ab5b; }
  code { background: #f3f5f8; padding: 2px 6px; border-radius: 4px; }
  table { font-size: 0.7em; }
  .accent { color: #05ab5b; font-weight: 600; }
---

<!-- _class: lead -->

# ablefy — Onboarding Redesign

**Product Builder case study**
Firat Gomi · May 2026

---

## Alex's Job

Launch a **€1,499 AI training course** and a paid community.

10–15 minutes to decide if ablefy is the right tool.

**Time-to-value is everything.**

---

## Three Blockers

| Blocker | What happens | Time lost |
|---------|-------------|-----------|
| **1. Onboarding** | 6-step form, compliance warnings, phone required | ~8 min |
| **2. Course Creation** | Payment overload, legacy builder, buried content tab | ~45 min |
| **3. Community** | foroom redirect, separate auth, dead-end blank page | ~15 min |

This case study addresses Blockers 1 + 2.

---

## The Audit — 11 issues, one root cause

The platform is built for **operators who already know what they're doing**, not for creators who are deciding whether to stay.

- Onboarding asks for ablefy's data before delivering Alex's value
- Course creation exposes power-user features at the wrong moment
- Post-creation hierarchy treats secondary actions as equal to primary

---

## Pain Points

**PP1: Data collection before value delivery**
Alex's first 15 minutes serve ablefy's needs, not his.

**PP2: Cognitive overload during creation**
Power-user complexity at the moment Alex needs simplicity.

---

## Option 01 — Targeted fix (this prototype)

`Addresses: Blocker 1 · Pain Point 1`

- Removed the 6-step onboarding form entirely
- Signup: name + email + password only (30 s)
- First-visit modal on dashboard: guided or skip
- Inline product creation (name / type / description / price)
- Contextual dashboard that tracks where Alex is in the journey
- Content creation inline — no separate builder screen

**Ships in weeks. ~5 minutes time-to-value.**

---

<!-- prototype:flow-diagram -->
## Solution Option 01 — Flow

```
/signup          /welcome          /dashboard
┌───────────┐   ┌──────────────┐  ┌──────────────────────────────────┐
│ Name      │   │ Welcome,     │  │ Blur-overlay modal (first visit) │
│ Email     │──►│ {name}.      │─►│  Step 1: Welcome, {name}         │
│ Password  │   │              │  │  Step 2: Create product (inline) │
└───────────┘   │ Show me how  │  │          name/type/desc/price    │
  30 s          │ Skip         │  │  Step 3: Add content CTA         │
                └──────────────┘  └──────────────────────────────────┘
                  10 s                       ▼
                                  Dashboard adapts per step:
                                  Step 1 → "Create your first product"
                                  Step 2 → "Add content to your product"
                                  Step 3 → "You're ready to go live"
                                             ▼
/products/:id/created     /products/:id?tab=content
┌───────────────────┐     ┌────────────────────────────────────────┐
│ ✓ {Name} is ready │     │ Content tab: inline module creation    │
│ SetupSteps tracker│────►│ "Add item" → type name → Save module  │
│ Add Course Content│     │ "+ Add lesson" → inline lesson form   │
└───────────────────┘     └────────────────────────────────────────┘
  30 s                      90 s

Total target: under 5 minutes
```

---

<!-- prototype:routes -->
## Prototype walkthrough — Signup

`/signup`

**What changed from current ablefy:**

- **Before:** name, email, password, phone, shop name, business type, price range, sales goal, audience, website, revenue goal — 6 screens
- **After:** name, email, password — one screen, 30 seconds

All business data moved to **Settings → Profile**, surfaced after the first product is created.
Never a blocker.

---

## Prototype walkthrough — Welcome

`/welcome`

Personalized greeting: "Welcome, {name}."
One sentence: "Let's get your first product live."

Two paths — no data collected, no business questions:

- **Show me how** — advances to dashboard, blur-modal opens at step "create-product"
- **Skip — I'll figure it out** — advances directly to empty dashboard

---

## Prototype walkthrough — Dashboard (Step 1)

`/dashboard` (first visit, no products)

**Blur-overlay modal — 3 steps:**

1. `welcome` — "Welcome, {name}. Let's get your first product live. It takes under 2 minutes." → Show me how / Skip
2. `create-product` — inline form: product name *, type (Online Course / pre-recorded / Digital download), description *, price (EUR prefix, free if blank) — per-field validation with inline errors
3. `add-content` — "Product created!" confirmation → "Add course content" or "I'll do it later"

**Hero card adapts:** "Create your first product." with a numbered "What happens next" explainer.
**4-step progress tracker** (SetupSteps): Create product · Add content · Start selling · Get paid.

---

## Prototype walkthrough — Dashboard (Step 2)

`/dashboard` (product exists, content not yet added)

Modal dismissed. Dashboard detects `products.length > 0` and `step2_done !== '1'` in localStorage.

**Hero card changes to:** "Add content to your product."
CTA navigates directly to `/products/{id}?tab=content`.

**Also on dashboard:**
- Quick-access shortcuts: Market & Sell · Customers · Analytics
- Analytics sparklines (conversion rate, incoming payments)
- Product updates feed (3 entries with tags and dates)
- Notification bell: 5 entries, tabs All / Unread / Important, mark-all-read
- User avatar dropdown: Settings modal (name / email / password) · Logout

---

## Prototype walkthrough — Dashboard (Step 3)

`/dashboard` (product exists, `ablefy.step2_done = '1'` set)

Hero card changes to: **"You're ready to go live."**
CTA navigates to product detail for publishing.

localStorage flag `ablefy.step2_done` is set by the Content tab when the first module is saved.
Dashboard re-reads the flag on window focus — tab-switching triggers the transition automatically.

---

## Prototype walkthrough — Sidebar

All routes rendered inside `CabinetShell`.

- **Black background** sidebar matching ablefy's design system
- Icon for every nav item
- **Collapsible:** hamburger top-left collapses; logo top-right; ablefy glyph at bottom when collapsed
- **Smooth page transition animation** on every navigation event

---

## Prototype walkthrough — Products list

`/products`

| Change | Detail |
|--------|--------|
| Table min-height | 640 px — no collapsing on empty state |
| Column rename | "Sell" → **"Live"** (status indicator dot) |
| Info icon | Removed |
| Row click | Navigates to `/products/:id` |
| Dropdown menu | Fixed positioning (no overflow clipping) |
| Create button | "+" only — no label text |

---

## Prototype walkthrough — Product detail

`/products/:id`

**Action bar removed.** Preview / Unpublish / Duplicate / Archive moved into the "..." header menu only.

**Content tab — inline creation:**

1. Empty state: "No modules yet" → **"Add item"** button
2. Inline form appears: type module name → Enter or Save → module created
3. Module expands; **"+ Add lesson"** appears → inline lesson form
4. Saving first module sets `localStorage.ablefy.step2_done = '1'` → dashboard step advances

Step 2 completion is recorded without any full-page navigation.

---

## Prototype walkthrough — Product created

`/products/:id/created`

- Animated checkmark (stroke-dashoffset draw-in, 300 ms)
- Success pulse on card mount (scale 1 → 1.03 → 1, 400 ms)
- Primary CTA: **"Add Course Content"** → `/products/:id/content`
- **"More options" disclosure removed** — replaced with `SetupSteps` progress tracker showing where Alex is in the full journey

---

## Option 02 — Full redesign (next iteration)

`Addresses: Blockers 1 + 2 · Pain Points 1 + 2`

AI chatbot replaces the form. AI generates a ready course. Alex edits.

**Time-to-value: under 3 minutes. Matches ablefy's AI-first identity.**

---

## Why two options?

**Option 01** ships now. Works within current architecture.

**Option 02** is the competitive leap. Positions ablefy as the AI-first creator platform it claims to be.

**Recommendation:** Ship Option 01 now. Build toward Option 02.

---

## Open questions for engineering

1. Can draft courses exist under unverified accounts?
2. What downstream systems consume the onboarding form data?
3. Does ablefy have LLM infrastructure for the chatbot?
4. Is the page builder a hard dependency or replaceable?
5. Is foroom integration on the 2026 roadmap?

---

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 · TypeScript · Vite · Tailwind CSS |
| Backend | Hono · Node.js · better-sqlite3 (SQLite) |
| Auth | HTTP-only cookies · bcrypt |
| Deploy | Railway — RAILPACK builder |
| Tests | Vitest · Playwright |

<br>

<a href="https://ablefy-case-ahmedsulaiman.up.railway.app/dashboard" target="_blank" style="display:inline-block;background:#05ab5b;color:#fff;font-weight:700;padding:14px 32px;border-radius:99px;text-decoration:none;font-size:1rem;letter-spacing:0.01em;">
  Try the live prototype →
</a>

---

<!-- _class: lead -->

# Thank you.

firatgomi@gmail.com

