---
marp: true
theme: default
paginate: true
backgroundColor: '#fafafc'
color: '#21282e'
style: |
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

  section {
    font-family: 'Inter', sans-serif;
    font-size: 1rem;
    padding: 52px 64px;
  }

  h1 { font-size: 2.4rem; font-weight: 700; line-height: 1.15; color: #21282e; }
  h2 { font-size: 1.6rem; font-weight: 600; color: #21282e; margin-bottom: 0.6em; }
  h3 { font-size: 1.15rem; font-weight: 600; color: #21282e; margin-bottom: 0.3em; }

  strong { color: #05ab5b; }
  em { color: #21282e; font-style: normal; font-weight: 500; }

  code {
    background: #f3f5f8;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.85em;
    color: #21282e;
  }

  pre code {
    font-size: 0.72rem;
    background: transparent;
    padding: 0;
  }

  pre {
    background: #f3f5f8;
    border-radius: 8px;
    padding: 20px 24px;
  }

  table {
    font-size: 0.72em;
    width: 100%;
    border-collapse: collapse;
  }

  th {
    background: #f3f5f8;
    font-weight: 600;
    padding: 8px 12px;
    text-align: left;
    border-bottom: 2px solid #e4e8ee;
  }

  td {
    padding: 7px 12px;
    border-bottom: 1px solid #e4e8ee;
    vertical-align: top;
  }

  blockquote {
    border-left: 3px solid #05ab5b;
    padding-left: 20px;
    margin-left: 0;
    color: #4a5568;
    font-style: italic;
    font-size: 1.05em;
  }

  .lead h1 { font-size: 3rem; }

  ul { padding-left: 1.4em; }
  li { margin-bottom: 0.35em; line-height: 1.55; }

  footer {
    font-size: 0.65rem;
    color: #9aa5b4;
  }

  section.cover {
    background: #0d1117;
    color: #fafafc;
    justify-content: flex-end;
  }
  section.cover h1 { color: #fafafc; font-size: 2.6rem; }
  section.cover h2 { color: #9aa5b4; font-size: 1rem; font-weight: 400; margin-top: 0.5em; }
  section.cover strong { color: #05ab5b; }

  section.stat {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
  }
  section.stat .number {
    font-size: 6rem;
    font-weight: 700;
    color: #21282e;
    line-height: 1;
  }
  section.stat strong { font-size: 6rem; }

  section.quote {
    background: #f3f5f8;
    justify-content: center;
  }
  section.quote blockquote { font-size: 1.3em; }

  section.accent-dark {
    background: #0d1117;
    color: #fafafc;
  }
  section.accent-dark h2 { color: #fafafc; }
  section.accent-dark strong { color: #05ab5b; }
  section.accent-dark table th { background: #1e2530; color: #fafafc; border-bottom-color: #2e3844; }
  section.accent-dark table td { color: #c9d1db; border-bottom-color: #2e3844; }

  section.transition {
    background: #05ab5b;
    color: #fafafc;
    justify-content: center;
    text-align: center;
  }
  section.transition h2 { color: #fafafc; font-size: 2rem; }
  section.transition p { color: rgba(255,255,255,0.8); font-size: 1.1em; }
---

<!-- _class: cover -->

# ablefy — Onboarding Redesign

**Product Builder case study**

Ahmed Sarkawt · May 2026

---

## The Setup

Alex is 28. He has **10,000 followers** and a deep expertise in AI tools.

He wants to launch a **€1,499 AI training course** and a paid community.

He gives himself **10–15 minutes** to decide if ablefy is the right tool.

---

<!-- _class: stat -->

## Current state: signup → course created

**150 min**

vs. under **20** on comparable platforms

---

This is not a product gap. This is a conversion problem.

Every minute past the 15-minute evaluation window is **a creator who doesn't convert**.

---

## This isn't just Alex

I walked the full flow as Alex, measuring each step against one question:

> *Does this move Alex closer to creating something, or does it move ablefy closer to collecting something?*

Then I validated what I found across **30+ independent sources** — German and English blogs, platform reviews, YouTube walkthroughs.

**~70–75% of the friction Alex encountered maps directly to documented real-user complaints.**

These are not constructed pain points.

---

<!-- _class: quote -->

## What real creators said

> *"Die vielen Funktionen können anfangs überfordern."*
> (The many features can feel overwhelming at first.)
> — Isabelle Moegelin, YouTube creator

> *"Wenn du dich das allererste Mal einloggst, kann das ziemlich überwältigend wirken."*
> (When you first log in, it can seem quite overwhelming.)
> — Everyblue, first-login review

> *"Die Kurserstellung wäre mir ohne Masterclass und Tutorials niemals gelungen."*
> (Course creation would never have worked for me without the Masterclass and tutorials.)
> — Martina L., Capterra 4/5

---

<!-- _class: transition -->

## Three blockers stand between Alex and his goal

---

## Three Blockers

| Blocker | What happens | Time lost | Impact |
|---------|-------------|-----------|--------|
| **1. Onboarding** | 6-step data collection form, compliance warnings, phone number — all before Alex creates anything | ~8 min | 100% of new users delayed |
| **2. Course Creation** | 5 payment models, 12 Advanced Settings toggles, legacy builder, buried content tab, no guidance | ~45 min – 3 hrs | Alex questions if ablefy is too complex |
| **3. Community** | Redirect to foroom.ai, separate auth, blank page dead end, no return path | ~15 min | Trust tax — feels like a different product |

This case study addresses **Blockers 1 and 2.**

---

## The root cause

**The platform is built for operators who already know what they're doing — not for creators who are still deciding whether to stay.**

Ablefy optimizes for **data completion** rather than **user momentum**.

---

## The 11 Issues

| Step | Challenge | Pain Point |
|------|-----------|------------|
| Signup | Phone required, no social login | PP1 |
| Dashboard | 3 compliance banners on first load | PP1 |
| Onboarding | 6-step form, zero output for Alex | PP1 |
| Dashboard | Admin tasks mixed with creation steps | PP1 |
| Creation | 5 payment tiles + 12 Advanced Settings toggles | PP2 |
| Creation | UI elements shift without transitions | PP2 |
| Creation | "Upload from library" label mismatch | PP2 |
| Creation | "Previous" button closes modal | PP2 |
| Post-creation | Primary action buried below 3 secondary options | PP2 |
| Products page | Content tab hidden, no "add first lesson" prompt | PP2 |
| Content builder | Legacy page builder requires a learning curve | PP2 |

**4 from onboarding. 7 from creation. One root cause.**

---

<!-- _class: transition -->

## Option 01
### Fix the Current Flow

---

## What We're Solving and Why

**Scope:** Signup → Course Created (Blockers 1 + 2)

**Why this scope, not community:**
- Affects **100% of new users**
- Highest-motivation moment — Alex is most willing to invest effort right after signup
- Contains 11 of the 11 challenges found
- Competitors (Kajabi) solve this in **under 3 minutes**
- Directly supports ablefy's 2026 roadmap: reliability, stability, AI-first positioning

---

## Option 01 — The Changes

**What:** Targeted improvements within the existing system. No architectural changes.

| Before | After |
|--------|-------|
| 6-step onboarding form | Removed. Name + email + password only (30 sec) |
| 3 compliance banners on load | Moved to Settings → Profile, post-creation |
| 5 payment models at creation | Single "set your price" field, smart defaults |
| Primary CTA buried post-creation | "Add Course Content" leads. Options follow. |
| Content tab hidden in product detail | "Add your first lesson" inline, no separate builder |

**Result:** ~150 min → **~5 min** time-to-value. Ships in weeks.

---

## Option 01 — The Flow

```
/signup          /welcome          /dashboard (first visit)
┌───────────┐   ┌──────────────┐  ┌──────────────────────────────────┐
│ Name      │   │ Welcome,     │  │ Blur-overlay modal               │
│ Email     │──►│ {name}.      │─►│  Step 1: Welcome, {name}         │
│ Password  │   │              │  │  Step 2: Create product (inline) │
└───────────┘   │ Show me how  │  │          name / type / desc / €  │
   30 sec       │ Skip         │  │  Step 3: Add content CTA         │
                └──────────────┘  └──────────────────────────────────┘
                   10 sec                      ▼
                                 Dashboard hero adapts per state:
                                 No product  → "Create your first product"
                                 No content  → "Add content to your product"
                                 Ready       → "You're ready to go live"
                                              ▼
/products/:id/created            /products/:id?tab=content
┌───────────────────────┐        ┌──────────────────────────────┐
│ ✓ {Name} is ready     │        │ Inline module creation        │
│ SetupSteps tracker    │───────►│ "Add item" → type name → Save │
│ "Add Course Content"  │        │ "+ Add lesson" → inline form  │
└───────────────────────┘        └──────────────────────────────┘
      30 sec                              90 sec
                                         ↑
                           Sets localStorage flag → dashboard advances
```

**Total: under 5 minutes**

---

## Prototype — Key Screens

**Signup** `/signup`
One screen. Name, email, password. 30 seconds. All business data moved to Settings, surfaced after the first product is created. Never a blocker.

**Welcome** `/welcome`
Personalized. "Welcome, {name}. Let's get your first product live." Two paths — Show me how / Skip. No data collected, no business questions.

**Dashboard** `/dashboard`
Blur-overlay modal guides the first session. Hero card adapts to where Alex is. SetupSteps tracker (Create product · Add content · Start selling · Get paid) is always visible.

**Product Created** `/products/:id/created`
Animated checkmark. "Add Course Content" leads. SetupSteps replaces the buried "More options" disclosure.

**Content Tab** `/products/:id?tab=content`
Inline module and lesson creation. No legacy builder. Saving the first module advances the dashboard state automatically.

---

<!-- _class: transition -->

## Option 02
### AI-First Course Creation

---

<!-- _class: accent-dark -->

## Option 02 — The Vision

`Addresses: Blockers 1 + 2 · Pain Points 1 + 2`

**What:** New flow where Alex goes from signup to a ready-to-edit course in under 3 minutes.

| Step | Time | What happens |
|------|------|-------------|
| Signup | 30 sec | Name, email, password. No phone. No shop name. |
| AI Chatbot | 60 sec | Replaces the 6-step form. Alex says "I want to sell an AI training course for €1,499." Chatbot asks 2–3 follow-ups. Same data, zero friction. |
| Course Generated | 30 sec | AI creates: course structure, product page, checkout with defaults, landing page. Alex sees a **complete course**, not a blank canvas. |
| Edit or Start Fresh | — | Edit what was generated, or start from scratch. |

**Issues resolved:** All 11. The problems don't get fixed — they disappear. The paradigm changes.

---

<!-- _class: accent-dark -->

## Option 02 — The Enrich Layer

After the AI generates an outline, an "Enrich this outline" panel appears:

```
┌───────────────────────────────────────────────────────────────┐
│  Enrich this outline                                          │
│                                                               │
│  [⊞ Import Canva deck]  [⊞ Pull from Google Drive]          │
│  [⊞ Sync Notion page]                                        │
└───────────────────────────────────────────────────────────────┘
  Module 1: Foundations              [↻] [×]
    • Lesson 1.1 — Getting started
    • Lesson 1.2 — Core concepts
  Module 2: Hands-on practice        [↻] [×]

  [Looks good — create draft]   [Start over]    💬 chat
```

Clicking any integration opens the chat panel, pre-populated with one question.

> *"Creators don't start from scratch. Alex already has a Canva deck, a Drive folder, a Notion page. The platform meets him where he already works."*

---

<!-- _class: transition -->

## Risks

---

## Risks & Mitigation

| Risk | What could go wrong | Mitigation |
|------|--------------------|-----------  |
| **Adoption** | Removing the 6-step form creates anxiety — creators wonder what they agreed to | Surface deferred fields as optional wins after first product is created, not as skipped steps |
| **Two-path inconsistency** | The guided modal and the direct creation route give different experiences. Engineers ask: which is the source of truth? | One creation flow. Guided modal for all new users. Full settings accessible after creation only. |
| **Measurement gap** | If `onboarding_events` isn't tracked correctly pre-launch, there's no baseline to compare against. Option 01 ships but can't be proven. | Log `signup_completed` and `product_created` server-side **before** shipping. Establish the baseline first. |

---

## Validation Plan

**Step 1 → Validate the problem**
Talk to 3–5 creators who tried or considered a course platform in the last 6 months. No prototype yet. One question: *"What stopped you from launching?"* Confirms the 11 issues, or reveals something missed.

**Step 2 → Validate the solution**
3 moderated walkthroughs. One task: *"Sell an AI training course for €1,499. Start from signup."*
Measure: time to product created · where they hesitate · whether they click "Add Course Content" without prompting.
**Success criteria:** Under 5 minutes. No one stuck on payment.

**Step 3 → Validate the business case**
Track trial-to-product-created conversion weekly for 45 days post-launch (smaller cohort).
A **10–15% lift** confirms Option 01 worked. Flat means the blocker was elsewhere.

---

## Recommendation

**Ship Option 01. Validate Option 02.**

| | What | When |
|-|------|------|
| **Track 1** | 3 creator interviews → prototype walkthroughs → ship if validated → measure for 30 days | Weeks 1–4 |
| **Track 2** | Use the same interviews to probe Option 02: *"Would an AI-generated course scaffold change how you evaluated ablefy?"* | Weeks 5–9 |

Track 2 ends with a data-backed decision.

---

## On My Process

**No public design system.** I reverse-engineered one — extracting tokens, type scale, spacing, and component patterns directly from the live product before writing a line of prototype code.

**Prototype built under pressure.** Five hours. Runtime errors, dependency conflicts, broken state on reload. I kept the scope. The constraints became the test.

**The real challenge wasn't any single screen.** It was maintaining a coherent mental model across the full flow, so signup, creation, and post-creation feel like *one product* — not three features bolted together.

> *Every decision was tested against the same question: does this serve the creator's intent, or the platform's?*

---

<!-- _class: cover -->

# Thank you.

Questions welcome.

**Ahmed Sarkawt**
cadis13otaku@gmail.com
