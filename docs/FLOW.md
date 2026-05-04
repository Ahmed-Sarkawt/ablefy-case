# Flow — Signup to Course Created (Redesigned)

> The exact step-by-step Alex walks through in the prototype.
> Each step has a target time and success criterion. The full flow target is **under 5 minutes**.

## Flow diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  /signup                  /welcome              /dashboard           │
│  ┌──────────┐            ┌──────────┐          ┌──────────┐          │
│  │ Name     │  ───────►  │ Hi Alex! │  ─────►  │  Create  │          │
│  │ Email    │            │ Quick    │          │  your    │          │
│  │ Password │            │ tour OR  │          │  first   │          │
│  └──────────┘            │ Skip     │          │  product │          │
│   30 seconds              └──────────┘          └──────────┘          │
│                            10 seconds            20 seconds          │
│                                                       │              │
│                                                       ▼              │
│  /products/created       /products/new                                │
│  ┌──────────┐            ┌──────────┐                                 │
│  │ ✓ Course │  ◄───────  │ Title    │                                 │
│  │   ready! │            │ Desc     │                                 │
│  │ ──────── │            │ Image    │                                 │
│  │ [Add     │            │ Price €  │                                 │
│  │  Content]│            └──────────┘                                 │
│  │ More ▾   │             90 seconds                                  │
│  └──────────┘                                                         │
│   30 seconds                                                          │
│                                                                      │
│  Total target: under 5 minutes                                        │
└──────────────────────────────────────────────────────────────────────┘
```

## Step 1 — Signup (`/signup`)

**Target time:** 30 seconds

**Fields:**
- Name
- Email
- Password (min 8 chars)
- Optional: "Sign up with Google" button (mocked)

**Removed from current ablefy:** phone number, shop name.

**Success criterion:** User row in DB. Redirect to `/welcome`. `onboarding_events` row with `event_type='signup_completed'`.

**Animations:**
- Form card fades in on mount (200ms, opacity only)
- Submit button shows a spinner during the 200ms simulated request

## Step 2 — Welcome (`/welcome`)

**Target time:** 10 seconds (or skipped)

**Content:**
- Personalized greeting: "Welcome, {name}."
- One-sentence value prop: "Let's get your first product live."
- Two buttons: **"Show me how" (secondary)** and **"Skip — I'll figure it out" (primary green)**
- No data collection. No business questions. No compliance warnings.

**Removed from current ablefy:** the entire 6-step onboarding form.

**Where the data went:** business type / price range / sales goal / audience / website / revenue goal are all moved to **Settings → Profile** as optional fields, surfaced after the user has created a product. They're never blockers.

**Success criterion:** Either button advances to `/dashboard`. `onboarding_events` row with `event_type='welcome_completed'` and an attribute distinguishing tour vs. skip.

**Animations:** None. This screen is meant to feel light and skippable.

## Step 3 — Dashboard (`/dashboard`)

**Target time:** 20 seconds (the user looks around, then clicks Create)

**Layout:**
- Sidebar (matches current ablefy) — Overview active
- Top bar (matches current) — minus the trial-upgrade nag
- Main content:
  - **One** card: "Create your first product." Big green CTA. Brief one-sentence helper text.
  - Below: a smaller "What you can build" panel with three example types (course, ebook, membership) — purely informational, click does nothing yet.
- **No warning banners.** Compliance is in Settings → Compliance with a single subtle indicator badge in the avatar menu.

**Animations:**
- Stagger reveal on the dashboard cards (250ms, 50ms staggered)

**Success criterion:** User clicks the primary CTA, navigates to `/products/new`. `onboarding_events` row with `event_type='create_clicked'`.

## Step 4 — Product creation (`/products/new`)

**Target time:** 90 seconds

**Fields (single page, no multi-step modal):**
- Product name *
- Short description *
- Cover image (URL input, with a "Use a sample image" helper for the demo)
- Price (single field, defaults to €99, currency from user's profile or €) — that's it. No payment-model tiles.
- Hidden behind "Advanced settings" disclosure: payment model, installments, trial, currency override. Closed by default.

**Removed from current ablefy:** the 5-tile payment model picker upfront, the 12-toggle Advanced Settings panel, the dual-language fields, the legacy banking UI feel.

**Animations:**
- Modal-style page entrance (200ms scale-in, ease-out)
- Field focus ring uses the green focus token
- Submit button shows progress

**Validation:**
- Name: 3–100 chars
- Description: 10–500 chars
- Price: positive number, max 99999.99
- All errors inline, with `aria-describedby`

**Success criterion:** Product row in DB with `status='draft'`. Redirect to `/products/{id}/created`. `onboarding_events` row with `event_type='product_created'` and `time_since_signup_ms`.

## Step 5 — Product created (`/products/:id/created`)

**Target time:** 30 seconds (read, click primary)

**Layout:**
- Big success card: "🎉 {Product Name} is ready"
- One sentence: "Now add your course content. You can publish it whenever you're ready."
- **One** primary action: **"Add Course Content"** (green, large)
- Disclosure: **"More options ▾"** — when opened, reveals: Edit product page · Customize checkout · Set up delivery. These are the three currently-buried-at-equal-weight actions, demoted to secondary.

**Animations:**
- Success pulse on mount (single scale 1 → 1.03 → 1, 400ms)
- Checkmark draws in via `stroke-dashoffset` (300ms)

**Success criterion:** "Add Course Content" navigates to `/products/{id}/content` (placeholder page in the prototype, since content building is out of scope). `onboarding_events` row with `event_type='post_creation_action'` and the action name.

## Time-to-value measurement

The prototype computes total time as `time(product_created) - time(signup_completed)` from `onboarding_events`. Displayed at the top of `/dev/metrics` (a hidden dev route that lets us read the table during demos).

## What this flow does not solve

- It does not handle Blocker 2 (course creation complexity / page builder learning curve). That's Option 02's territory.
- It does not solve Blocker 3 (community redirect). Out of scope.
- It does not address localization (German vs. international) — flagged in open questions.
