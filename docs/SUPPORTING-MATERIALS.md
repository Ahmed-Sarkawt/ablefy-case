# Supporting Materials — Diagrams & User Flows

> **Purpose:** Visual artefacts to lift directly into the final presentation deck.
> Covers both options side-by-side: **Option A** (targeted onboarding hotfix, [PLAN.md](./PLAN.md)) and **Option B** (AI course creator, [PLAN-OPTION-02.md](./PLAN-OPTION-02.md)).
> Diagrams use **Mermaid** (renders in Marp, GitHub, Notion, and most slide tools) and **ASCII** ribbons (consistent with [FLOW.md](./FLOW.md) for inline use).

---

## 1. The persona at a glance

```mermaid
flowchart LR
  A["Alex<br/>28 · AI influencer<br/>10K followers"] --> B["Evaluation window<br/>10–15 minutes"]
  B --> C{Can Alex create<br/>their first course<br/>in that window?}
  C -->|"Today: NO<br/>(15+ min, drops off)"| D["Churn"]
  C -->|"Option A: YES<br/>(~4.5 min)"| E["Activated"]
  C -->|"Option B: YES<br/>(~2.4 min)"| E
```

**The metric:** time-to-first-draft-course, measured from `signup_completed` to `product_created`/`outline_accepted` in `onboarding_events`.

---

## 2. Current ablefy — the problem state

### 2.1 Today's flow (the baseline we're fixing)

```mermaid
flowchart TD
  S["Landing page"] --> SU["Signup form<br/>name · email · password<br/>+ phone + shop name"]
  SU --> ON["6-step onboarding form<br/>business type · price range<br/>sales goal · audience<br/>website · revenue goal"]
  ON --> DB["Dashboard<br/>3 compliance warning banners<br/>trial-upgrade nag"]
  DB --> CP["Compliance gate<br/>KYC · banking · tax"]
  CP --> NP["New product<br/>5 payment-model tiles<br/>12 advanced toggles<br/>dual-language fields"]
  NP --> PB["Page builder<br/>blank canvas<br/>no contextual prompts"]
  PB --> PC["Post-creation<br/>4 equal-weight actions"]

  style ON fill:#fde2e2,stroke:#c0392b
  style DB fill:#fde2e2,stroke:#c0392b
  style NP fill:#fde2e2,stroke:#c0392b
  style PB fill:#fde2e2,stroke:#c0392b
```

**Red blocks = friction concentrations** (the audit's five blockers).

### 2.2 The five blockers mapped to fixes

```mermaid
flowchart LR
  B1["Blocker 1<br/>Signup + onboarding gate"] --> A1["Option A: 3-field signup"]
  B1 --> A2["Option B: brief replaces gate"]
  B2["Blocker 2<br/>Cold-start course builder"] --> A3["Option A: out of scope"]
  B2 --> A4["Option B: AI outline + dummy bodies"]
  B3["Blocker 3<br/>Compliance noise"] --> A5["Both: moved to Settings"]
  B4["Blocker 4<br/>Payment-model overload"] --> A6["Both: defaults to one-time price"]
  B5["Blocker 5<br/>Equal-weight CTAs"] --> A7["Both: single primary action"]

  style A3 fill:#f3f5f8,stroke:#9aa0a6
  style A4 fill:#d6f5e3,stroke:#17df87
  style A2 fill:#d6f5e3,stroke:#17df87
```

---

## 3. Option A — Targeted onboarding hotfix

### 3.1 User flow (ASCII ribbon, matches FLOW.md)

```
┌──────────────────────────────────────────────────────────────────────┐
│  /signup           /welcome            /dashboard                    │
│  ┌──────────┐     ┌──────────┐        ┌──────────┐                   │
│  │ Name     │ ──► │ Hi Alex! │ ─────► │  Create  │                   │
│  │ Email    │     │ Skip ▶   │        │  your    │                   │
│  │ Password │     └──────────┘        │  first   │                   │
│  └──────────┘      10 sec              │  product │                   │
│   30 sec                               └──────────┘                   │
│                                          20 sec                       │
│                                            │                          │
│                                            ▼                          │
│  /products/:id/created     /products/new                              │
│  ┌──────────┐              ┌──────────┐                               │
│  │ ✓ Course │ ◄──────────  │ Title    │                               │
│  │   ready! │              │ Desc     │                               │
│  │ [Add     │              │ Image    │                               │
│  │  Content]│              │ Price €  │                               │
│  │ More ▾   │              └──────────┘                               │
│  └──────────┘                90 sec                                   │
│   30 sec                                                              │
│                                                                       │
│  Total target: under 5 minutes                                        │
└──────────────────────────────────────────────────────────────────────┘
```

### 3.2 User flow (Mermaid for the deck)

```mermaid
flowchart LR
  A["/signup<br/>3 fields · 30s"] --> B["/welcome<br/>greeting + skip · 10s"]
  B --> C["/dashboard<br/>one welcoming card · 20s"]
  C --> D["/products/new<br/>name · desc · image · price · 90s"]
  D --> E["/products/:id/created<br/>one primary CTA · 30s"]
  E --> F(["Draft course live<br/>under 5 minutes"])

  style F fill:#d6f5e3,stroke:#17df87
```

### 3.3 Decision tree at `/welcome`

```mermaid
flowchart TD
  W["/welcome — Alex sees:<br/>'Welcome Alex.<br/>Let's get your first product live.'"] --> Q{Choice}
  Q -->|"Show me how"| T["Tour overlay<br/>3 callouts on dashboard"]
  Q -->|"Skip — I'll figure it out"| D["/dashboard<br/>(default path, primary green)"]
  T --> D
```

### 3.4 What got removed

```mermaid
flowchart LR
  subgraph Removed["Removed from current flow"]
    R1["6-step business form"]
    R2["Phone + shop name fields"]
    R3["3 compliance banners"]
    R4["5 payment-model tiles"]
    R5["12 advanced toggles"]
    R6["4 equal-weight CTAs"]
  end

  subgraph Kept["Where the data went"]
    K1["Settings → Profile<br/>(optional, post-creation)"]
    K2["Settings → Compliance<br/>(badge in avatar menu)"]
    K3["Advanced disclosure<br/>(closed by default)"]
    K4["More options ▾<br/>(disclosure)"]
  end

  R1 --> K1
  R2 --> K1
  R3 --> K2
  R4 --> K3
  R5 --> K3
  R6 --> K4

  style Removed fill:#fde2e2,stroke:#c0392b
  style Kept fill:#d6f5e3,stroke:#17df87
```

### 3.5 Time-to-value breakdown

```mermaid
gantt
  title Option A — Time-to-value (target: under 5 min)
  dateFormat  ss
  axisFormat  %S s

  section Signup
  3 fields                  :a1, 0, 30s
  section Welcome
  Greeting + skip           :a2, after a1, 10s
  section Dashboard
  Orient + click create     :a3, after a2, 20s
  section Product
  Name · desc · image · €   :a4, after a3, 90s
  section Created
  Read + add content        :a5, after a4, 30s
```

---

## 4. Option B — AI course creator

### 4.1 User flow (ASCII ribbon)

```
┌──────────────────────────────────────────────────────────────────────┐
│  /signup           /dashboard            /products/new/ai            │
│  ┌──────────┐     ┌──────────┐          ┌──────────────────┐         │
│  │ Name     │ ──► │ Create   │ ───────► │ "What do you     │         │
│  │ Email    │     │ with AI  │          │  want to teach?" │         │
│  │ Password │     │ [primary]│          │  ┌────────────┐  │         │
│  └──────────┘     │          │          │  │ textarea 🎤│  │         │
│   30 sec          │ Manual   │          │  └────────────┘  │         │
│                   │ [link]   │          │   Generate       │         │
│                   └──────────┘          └──────────────────┘         │
│                    10 sec                 20 sec (typing)            │
│                                                  │                   │
│                                                  ▼                   │
│  /products/:id/    /products/:id/        Outline editor              │
│  content           created               ┌────────────────────────┐  │
│  ┌──────────┐     ┌──────────┐          │ Module 1 ▾  [↻] [×]    │  │
│  │ Module 1 │ ◄── │ ✓ Course │ ◄─────── │   • Lesson 1.1  [edit] │  │
│  │ • Body   │     │   ready! │          │   • Lesson 1.2  [edit] │  │
│  │ Module 2 │     │ [Add     │          │ Module 2 ▾  [↻] [×]    │  │
│  │ • Body   │     │  Content]│          │   …                    │  │
│  │ "Edit -  │     │ More ▾   │          │ [Looks good] [Restart] │  │
│  │  full v" │     └──────────┘          │              💬 chat   │  │
│  └──────────┘      30 sec                └────────────────────────┘  │
│   60 sec                                  ~60 sec                    │
│                                                                      │
│  Total target: under 3 minutes                                       │
└──────────────────────────────────────────────────────────────────────┘
```

### 4.2 User flow (Mermaid for the deck)

```mermaid
flowchart LR
  A["/signup<br/>3 fields · 30s"] --> B["/dashboard<br/>'Create with AI' · 10s"]
  B --> C["/products/new/ai<br/>brief intake · 20s"]
  C --> D["AI streaming outline<br/>~10s generation"]
  D --> E["Outline editor<br/>edit · regenerate · ~50s"]
  E --> F["/products/:id/created<br/>30s"]
  F --> G["/products/:id/content<br/>read-only AI lesson bodies · 60s"]
  G --> H(["Full draft course<br/>under 3 minutes"])

  style H fill:#d6f5e3,stroke:#17df87
```

### 4.3 AI generation pipeline (sequence diagram)

```mermaid
sequenceDiagram
  participant U as Alex (browser)
  participant FE as React UI
  participant API as Hono /api/ai/outline
  participant AI as ai.ts (provider abstraction)
  participant FX as Fixtures (default)
  participant LV as Live Anthropic SDK<br/>(opt-in)
  participant DB as SQLite

  U->>FE: Types brief, clicks "Generate"
  FE->>API: POST brief (SSE)
  API->>AI: generateOutline(brief)
  alt AI_MODE=fixture (default)
    AI->>FX: hash(brief) → match
    FX-->>AI: stream events (50ms apart)
  else AI_MODE=live
    AI->>LV: messages.stream() w/ prompt cache
    LV-->>AI: stream content blocks
  end
  AI-->>API: OutlineEvent stream
  API-->>FE: SSE: topic → module × N → done
  FE-->>U: Modules pop in one by one
  API->>DB: INSERT generations (cached?, latency_ms)
  U->>FE: Edits inline, clicks "Looks good"
  FE->>API: POST /products (accept outline)
  API->>DB: INSERT products + lessons + brief
  API-->>FE: Redirect /products/:id/created
```

### 4.4 Outline editor — interaction states

```mermaid
stateDiagram-v2
  [*] --> Empty: Page mount
  Empty --> Validating: User types
  Validating --> Empty: < 20 chars
  Validating --> Submittable: ≥ 20 chars
  Submittable --> Generating: Click "Generate"
  Generating --> Streaming: First module arrives
  Streaming --> Editable: 'done' event
  Editable --> Editable: Inline edit / regenerate / delete
  Editable --> Saving: Click "Looks good"
  Saving --> Created: products + lessons inserted
  Created --> [*]
  Generating --> Failed: Error event
  Failed --> Submittable: Retry
  Failed --> Manual: "Build it manually"
  Manual --> [*]: Route to /products/new
```

### 4.5 The three "coming in full version" affordances

```mermaid
flowchart TD
  subgraph Brief["Brief intake screen"]
    V["🎤 Voice dictation icon<br/>(textarea top-right)"]
  end

  subgraph Editor["Outline editor"]
    C["💬 Refine with chat<br/>(floating bubble)"]
  end

  subgraph Content["/products/:id/content"]
    L["✏️ Edit lesson body<br/>(right rail per lesson)"]
  end

  V -->|hover/click| VT["'Voice dictation —<br/>connects to a Chinese<br/>open-source model in<br/>the full version.'"]
  C -->|click| CT["Side panel:<br/>'Multi-turn refinement<br/>is coming in the full<br/>version. Use regenerate<br/>or edit inline for now.'"]
  L -->|hover| LT["'Edit lesson body —<br/>coming in the full<br/>version.'"]

  style VT fill:#fff7e6,stroke:#d4a017
  style CT fill:#fff7e6,stroke:#d4a017
  style LT fill:#fff7e6,stroke:#d4a017
```

### 4.6 Data model overview (Option A vs Option B)

```mermaid
erDiagram
  users ||--o{ products : owns
  products ||--o{ lessons : contains
  users ||--o{ onboarding_events : emits
  users ||--o{ course_briefs : "Option B only"
  course_briefs ||--o{ generations : "Option B only"
  course_briefs ||--o| products : "Option B only"
  lessons }o--|| course_briefs : "Option B: source_brief_id"

  users {
    text id PK
    text email
    text name
    text inferred_topic "Option B"
    text inferred_audience "Option B"
  }
  products {
    text id PK
    text user_id FK
    text name
    int price_cents
    text status
  }
  lessons {
    text id PK
    text product_id FK
    text title
    text description "Option B"
    text body "Option B (dummy)"
    int suggested_duration_min "Option B"
    int ai_generated "Option B"
  }
  course_briefs {
    text id PK
    text user_id FK
    text raw_input
    text inferred_topic
    int suggested_price_cents
    text ai_mode
  }
  generations {
    text id PK
    text brief_id FK
    text scope
    text prompt_hash
    int latency_ms
    int cached
  }
```

### 4.7 Time-to-value breakdown

```mermaid
gantt
  title Option B — Time-to-value (target: under 3 min)
  dateFormat  ss
  axisFormat  %S s

  section Signup
  3 fields                  :b1, 0, 30s
  section Dashboard
  Click "Create with AI"    :b2, after b1, 10s
  section Brief
  Type 1–3 sentences        :b3, after b2, 20s
  section Generation
  AI streaming outline      :b4, after b3, 10s
  section Editing
  Inline edit + regenerate  :b5, after b4, 50s
  section Created
  Read post-creation        :b6, after b5, 30s
```

---

## 5. Side-by-side comparison

### 5.1 Flow density

```mermaid
flowchart TB
  subgraph Today["Current ablefy · 15+ min"]
    T1["Signup +<br/>phone +<br/>shop name"] --> T2["6-step<br/>business form"] --> T3["Compliance<br/>banners ×3"] --> T4["Compliance<br/>gate"] --> T5["Payment-model<br/>tiles ×5"] --> T6["Page builder<br/>blank canvas"] --> T7["4 equal CTAs"]
  end

  subgraph A["Option A · ~4.5 min"]
    A1["Signup<br/>3 fields"] --> A2["Welcome<br/>+ skip"] --> A3["Dashboard<br/>one CTA"] --> A4["Product form<br/>4 fields + €"] --> A5["Created<br/>1 primary"]
  end

  subgraph B["Option B · ~2.4 min"]
    B1["Signup<br/>3 fields"] --> B2["Dashboard<br/>'Create with AI'"] --> B3["Brief<br/>1–3 sentences"] --> B4["Outline<br/>streaming + edit"] --> B5["Course content<br/>read-only viewer"]
  end

  style Today fill:#fde2e2,stroke:#c0392b
  style A fill:#fff7e6,stroke:#d4a017
  style B fill:#d6f5e3,stroke:#17df87
```

### 5.2 What each option costs and delivers

| Dimension | Today | Option A | Option B |
|---|---|---|---|
| **Time-to-value (target)** | 15+ min | ~4.5 min | ~2.4 min |
| **Steps in flow** | 7 | 5 | 5 |
| **Form fields before first product** | ~25 | 3 | 3 |
| **Decisions before first product** | High | Low | Very low |
| **Build cost (engineering hours)** | — | ~3 hours | ~4.5 hours |
| **Demo risk** | — | Very low | Low (fixture default) |
| **Hiring-signal value** | — | Engineering judgment + design fluency | Adds AI fluency, prompt caching, streaming UX |
| **Persona fit for Alex** | Poor | Good | Excellent |
| **Production readiness** | — | Ship next sprint | Ship next quarter |

### 5.3 Roadmap framing for the deck

```mermaid
gantt
  title Phased roadmap — Option A then Option B
  dateFormat  YYYY-MM-DD
  axisFormat  %b %d

  section Hotfix (Option A)
  Build & QA              :a1, 2026-05-05, 7d
  Ship to production      :milestone, after a1, 0d

  section Structural fix (Option B)
  Fixtures + AI plumbing  :b1, after a1, 14d
  UI: brief + outline     :b2, after b1, 14d
  Content viewer + polish :b3, after b2, 7d
  Ship to production      :milestone, after b3, 0d
```

---

## 6. Animation inventory

Both options together introduce **six** subtle, cross-browser animations. All `transform` / `opacity` only. All have `prefers-reduced-motion: reduce` fallbacks.

```mermaid
flowchart LR
  subgraph Shared["Option A (3)"]
    SA1["Stagger card reveal<br/>250ms · 50ms stagger"]
    SA2["Modal scale-in<br/>0.96 → 1 · 200ms"]
    SA3["Success pulse<br/>1 → 1.03 → 1 · 400ms"]
  end

  subgraph BOnly["Option B adds (3)"]
    SB1["Module reveal<br/>translateY(8) → 0 · 200ms"]
    SB2["Skeleton shimmer<br/>translateX loop · 1.5s"]
    SB3["Edit accept pulse<br/>green wash · 300ms"]
  end
```

---

## 7. Talk track (one slide per section)

The deck should follow this beat:

1. **The persona** — Alex, 10–15 min window. (Section 1 diagram.)
2. **The problem today** — 15+ minute flow with five blockers. (Section 2.1 + 2.2.)
3. **Option A — the hotfix** — flow ribbon, what got removed, where the data went. (Section 3.1, 3.4.)
4. **Option B — the structural fix** — flow ribbon, AI pipeline, three "full version" affordances. (Section 4.1, 4.3, 4.5.)
5. **Side-by-side** — flow density + cost/delivery table. (Section 5.1, 5.2.)
6. **Roadmap** — A as hotfix next sprint, B next quarter. (Section 5.3.)
7. **Trust + craft** — animation inventory, design-system fidelity, accessibility posture. (Section 6.)
8. **Live demo** — both flows in the prototype, time-to-value metric on `/dev/metrics`.

---

## 8. Asset checklist (for screenshots and the final deck)

| Asset | Source | Status |
|---|---|---|
| Persona card screenshot | Notion audit doc | TODO |
| Today's flow annotated | Manual screenshot of current ablefy + overlay | TODO |
| Option A — `/signup` | Prototype `/signup` | TODO (after Phase 2 of Option A) |
| Option A — `/welcome` | Prototype `/welcome` | TODO (after Phase 3 of Option A) |
| Option A — `/dashboard` | Prototype `/dashboard` | TODO |
| Option A — `/products/new` | Prototype `/products/new` | TODO |
| Option A — `/products/:id/created` | Prototype | TODO |
| Option B — `/products/new/ai` (brief) | Prototype | TODO (after Phase 5 of Option B) |
| Option B — outline streaming | Recorded GIF | TODO |
| Option B — outline edited | Prototype | TODO |
| Option B — `/products/:id/content` | Prototype | TODO |
| Live Haiku 4.5 capture | Recorded with `AI_MODE=live` during prep | TODO |
| `/dev/metrics` time-to-value | Prototype | TODO |

Screenshots live in `prototype/public/screenshots/option-01/` and `prototype/public/screenshots/option-02/`.
