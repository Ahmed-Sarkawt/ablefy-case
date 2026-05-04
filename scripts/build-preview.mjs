#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// Generates docs/preview.html — a self-contained SPA preview of the case-study
// diagrams, organized by category, with audience-specific tabs per diagram.
//
// Re-run after editing the manifest below to refresh the preview.

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(here, '..');
const target = join(repoRoot, 'docs', 'preview.html');

// -----------------------------------------------------------------------------
// Manifest — categories, diagrams, and per-audience tab content.
// Edit here to update the preview. Mermaid sources mirror docs/SUPPORTING-MATERIALS.md.
// -----------------------------------------------------------------------------

const categories = [
  { id: 'context', label: 'Context & Problem', accent: '#fde2e2', tint: '#fff5f5', stroke: '#c0392b' },
  { id: 'option-a', label: 'Option A — Hotfix', accent: '#fff7e6', tint: '#fffaf0', stroke: '#d4a017' },
  { id: 'option-b', label: 'Option B — AI Creator', accent: '#d6f5e3', tint: '#ecfaf2', stroke: '#17df87' },
  { id: 'compare', label: 'Comparison & Roadmap', accent: '#e6f0ff', tint: '#f3f7ff', stroke: '#2d62c4' }
];

const diagrams = [
  // ---- Context & Problem -----------------------------------------------------
  {
    id: 'persona',
    category: 'context',
    title: 'Persona at a glance',
    mermaid: `flowchart LR
  A["Alex<br/>28 · AI influencer<br/>10K followers"] --> B["Evaluation window<br/>10–15 minutes"]
  B --> C{Can Alex create<br/>their first course<br/>in that window?}
  C -->|"Today: NO"| D["Churn"]
  C -->|"Option A: ~4.5 min"| E["Activated"]
  C -->|"Option B: ~2.4 min"| E`,
    tabs: {
      engineering: 'Time-to-value is computed from <code>onboarding_events</code>: <code>product_created</code> minus <code>signup_completed</code>. Surfaced on the hidden <code>/dev/metrics</code> route. Schema lives in <code>prototype/server/db/schema.sql</code>; instrumentation is one helper plus one insert per flow step.',
      business: 'A 10-minute evaluation window makes activation the decisive metric for this segment. Today, most Alex-shaped users churn before activation. Both options improve activation by measurable amounts, captured in <code>onboarding_events</code> for review.',
      product: 'The persona is concrete (28, AI influencer, 10K followers). Every design decision pressure-tests against a single question: does this move Alex toward creating, or ablefy toward collecting? If neither, it is friction.'
    }
  },
  {
    id: 'today',
    category: 'context',
    title: "Today's flow",
    mermaid: `flowchart TD
  S["Landing page"] --> SU["Signup form<br/>+ phone + shop name"]
  SU --> ON["6-step onboarding form"]
  ON --> DB["Dashboard<br/>3 compliance banners"]
  DB --> CP["Compliance gate"]
  CP --> NP["New product<br/>5 payment tiles · 12 toggles"]
  NP --> PB["Page builder<br/>blank canvas"]
  PB --> PC["Post-creation<br/>4 equal CTAs"]

  style ON fill:#fde2e2,stroke:#c0392b
  style DB fill:#fde2e2,stroke:#c0392b
  style NP fill:#fde2e2,stroke:#c0392b
  style PB fill:#fde2e2,stroke:#c0392b`,
    tabs: {
      engineering: 'Maps to current ablefy production routes. The red blocks are friction concentrations, not engineering hotspots — most fixes are configuration or copy changes, not architectural rewrites.',
      business: 'Seven gates between landing and a draft course. Industry benchmarks for activation flows of this length put completion at 8–15%. Conservative estimate: today loses 70–85% of Alex-shaped users.',
      product: 'Each red block adds a separate decision before the user reaches their first product. Hick\'s Law and Cognitive Load Theory both predict cumulative drop-off as decision count grows. Removal is more effective than redesign at these decision densities.'
    }
  },
  {
    id: 'blockers',
    category: 'context',
    title: 'Five blockers → fixes',
    mermaid: `flowchart LR
  B1["Signup + onboarding gate"] --> A1["A: 3-field signup"]
  B1 --> A2["B: brief replaces gate"]
  B2["Cold-start course builder"] --> A3["A: out of scope"]
  B2 --> A4["B: AI outline + bodies"]
  B3["Compliance noise"] --> A5["Both: moved to Settings"]
  B4["Payment-model overload"] --> A6["Both: one-time default"]
  B5["Equal-weight CTAs"] --> A7["Both: single primary action"]

  style A3 fill:#f3f5f8,stroke:#9aa0a6
  style A4 fill:#d6f5e3,stroke:#17df87
  style A2 fill:#d6f5e3,stroke:#17df87`,
    tabs: {
      engineering: 'Both options reuse Option A\'s signup, dashboard, and post-creation screen unchanged. A and B share migration <code>001</code>; B adds <code>002</code>. Coexistence is real, not aspirational — the same <code>products</code> row shape ships from either path.',
      business: 'One audit, two solutions. Option A is a conservative hotfix scheduled for next sprint; Option B is a structural fix scheduled for next quarter. The two flows coexist in the prototype and share the same database schema.',
      product: 'Blocker 2 (cold-start course builder) is unsolved by Option A — by design. Solving it requires AI or a guided builder, both of which are larger efforts than a hotfix should carry.'
    }
  },

  // ---- Option A — Hotfix -----------------------------------------------------
  {
    id: 'a-flow-mermaid',
    category: 'option-a',
    title: 'User flow (Mermaid)',
    mermaid: `flowchart LR
  A["/signup<br/>3 fields · 30s"] --> B["/welcome<br/>greeting + skip · 10s"]
  B --> C["/dashboard<br/>one welcoming card · 20s"]
  C --> D["/products/new<br/>name · desc · image · price · 90s"]
  D --> E["/products/:id/created<br/>one primary CTA · 30s"]
  E --> F(["Draft course live<br/>under 5 minutes"])

  style F fill:#d6f5e3,stroke:#17df87`,
    tabs: {
      engineering: 'Five routes total: <code>/signup</code>, <code>/welcome</code>, <code>/dashboard</code>, <code>/products/new</code>, <code>/products/:id/created</code>. State persists in SQLite via Hono. No state machine required — the flow is linear.',
      business: 'Target: under 5 minutes from landing to draft. Tested via Playwright with timestamps from <code>onboarding_events</code> — the metric is reproducible across runs, not anecdotal.',
      product: 'Each step has a single primary CTA (Hick\'s Law). Welcome screen has a "skip" path because Alex is competent — never block on a tour the user did not ask for.'
    }
  },
  {
    id: 'a-welcome-tree',
    category: 'option-a',
    title: '/welcome decision tree',
    mermaid: `flowchart TD
  W["/welcome — Alex sees:<br/>'Welcome Alex.<br/>Let's get your first product live.'"] --> Q{Choice}
  Q -->|"Show me how"| T["Tour overlay<br/>3 callouts on dashboard"]
  Q -->|"Skip — I'll figure it out"| D["/dashboard<br/>(default path, primary green)"]
  T --> D`,
    tabs: {
      engineering: 'Single route, two CTAs, both navigate to <code>/dashboard</code>. Tour is rendered as an overlay component — no separate route. Path choice tracked via <code>welcome_completed</code> event with <code>attributes.path=\'tour\'|\'skip\'</code>.',
      business: 'The skip-vs-tour split tracks how much guidance the top-of-funnel actually wants. Initial hypothesis: 70%+ choose skip. The path attribute on <code>welcome_completed</code> records the choice for later analysis.',
      product: '"Skip" is the <em>primary</em> (green) button. Counter-intuitive but deliberate — Alex\'s persona signals competence, and the tour is the optional path. Defaults that match user intent reduce friction more than instructions ever do.'
    }
  },
  {
    id: 'a-removed',
    category: 'option-a',
    title: 'What got removed',
    mermaid: `flowchart LR
  subgraph Removed["Removed"]
    R1["6-step business form"]
    R2["Phone + shop name"]
    R3["3 compliance banners"]
    R4["5 payment-model tiles"]
    R5["12 advanced toggles"]
    R6["4 equal-weight CTAs"]
  end

  subgraph Kept["Where the data went"]
    K1["Settings → Profile"]
    K2["Settings → Compliance"]
    K3["Advanced disclosure"]
    K4["More options ▾"]
  end

  R1 --> K1
  R2 --> K1
  R3 --> K2
  R4 --> K3
  R5 --> K3
  R6 --> K4

  style Removed fill:#fde2e2,stroke:#c0392b
  style Kept fill:#d6f5e3,stroke:#17df87`,
    tabs: {
      engineering: 'Most removed fields became optional columns on <code>users</code> (Settings → Profile). Compliance moves to Settings. Advanced toggles move into a <code>&lt;Disclosure&gt;</code> component, default closed. No data is lost; nothing is gated.',
      business: 'We did not delete capabilities — we moved them out of the activation path. Compliance still runs; payment models still exist. The flow simply stops asking up front.',
      product: 'The pattern is <em>deferred elaboration</em>: ask only what is strictly needed, surface the rest contextually after activation. Aligns with Postel\'s Law applied to UX — be liberal in what the user provides, strict in what we require.'
    }
  },
  {
    id: 'a-gantt',
    category: 'option-a',
    title: 'Time-to-value (Gantt)',
    mermaid: `gantt
  title Option A — Time-to-value (target under 5 min)
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
  Read + add content        :a5, after a4, 30s`,
    tabs: {
      engineering: 'Gantt timestamps come straight from <code>onboarding_events</code>. Total target: 180s. Slack: 120s (so realistic upper bound: ~5 min). Measurement is reproducible across runs — not a stopwatch demo.',
      business: '4.5 minutes versus 15+ minutes today is roughly a 3× improvement on the activation metric. Every step in the flow is timestamped in <code>onboarding_events</code>, so the metric is reproducible across runs.',
      product: 'Product creation (90s) is rightly the longest step — that is where the user is doing the actual work. Welcome at 10s tests whether the screen feels skippable; if it does not, the design failed.'
    }
  },

  // ---- Option B — AI Creator ------------------------------------------------
  {
    id: 'b-flow-mermaid',
    category: 'option-b',
    title: 'User flow (Mermaid)',
    mermaid: `flowchart LR
  A["/signup<br/>3 fields · 30s"] --> B["/dashboard<br/>'Create with AI' · 10s"]
  B --> C["/products/new/ai<br/>brief intake · 20s"]
  C --> D["AI streaming outline<br/>~10s generation"]
  D --> E["Outline editor<br/>edit · regenerate · ~50s"]
  E --> F["/products/:id/created<br/>30s"]
  F --> G["/products/:id/content<br/>read-only AI bodies · 60s"]
  G --> H(["Full draft course<br/>under 3 minutes"])

  style H fill:#d6f5e3,stroke:#17df87`,
    tabs: {
      engineering: 'New route <code>/products/new/ai</code> handles brief intake plus outline editor (single page, two sections). New route <code>/products/:id/content</code> renders read-only AI lesson bodies. Backend adds <code>/api/ai/outline</code> (SSE) and <code>/api/ai/regenerate</code>.',
      business: 'Target: under 3 minutes — roughly 6× faster than today, ~2× faster than Option A. Crucially, the user ends up with course <em>content</em>, not just a course shell.',
      product: 'The brief intake replaces the 6-step business form by <em>being</em> it — audience and topic are inferred from the brief, never asked. Onboarding becomes a by-product of value creation.'
    }
  },
  {
    id: 'b-pipeline',
    category: 'option-b',
    title: 'AI generation pipeline',
    mermaid: `sequenceDiagram
  participant U as Alex (browser)
  participant FE as React UI
  participant API as Hono /api/ai/outline
  participant AI as ai.ts (abstraction)
  participant FX as Fixtures (default)
  participant LV as Live Anthropic SDK
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
  API-->>FE: Redirect /products/:id/created`,
    tabs: {
      engineering: 'Provider abstraction (<code>server/lib/ai.ts</code>) lets fixtures and live SDK share an interface. Fixtures are pre-baked JSON keyed by hash of the brief\'s first 32 chars. Live mode uses Anthropic SDK <code>messages.stream()</code> with <code>cache_control: { type: \'ephemeral\' }</code> on the system block.',
      business: 'Default mode (fixture) costs $0 and runs offline. Live mode (Claude Haiku 4.5) costs approximately $0.001 per outline. At twenty generations per evaluation cycle, total cost is approximately $0.02.',
      product: 'Three failure modes are first-class citizens: 503 (no key), 500 (model error), 429 (rate limit). Each has its own UI state. Never a dead end — there is always a "build it manually" escape hatch.'
    }
  },
  {
    id: 'b-states',
    category: 'option-b',
    title: 'Outline editor states',
    mermaid: `stateDiagram-v2
  [*] --> Empty: Page mount
  Empty --> Validating: User types
  Validating --> Empty: < 20 chars
  Validating --> Submittable: ≥ 20 chars
  Submittable --> Generating: Click "Generate"
  Generating --> Streaming: First module arrives
  Streaming --> Editable: 'done' event
  Editable --> Editable: Inline edit / regenerate
  Editable --> Saving: Click "Looks good"
  Saving --> Created: products + lessons inserted
  Created --> [*]
  Generating --> Failed: Error event
  Failed --> Submittable: Retry
  Failed --> Manual: "Build it manually"
  Manual --> [*]: Route to /products/new`,
    tabs: {
      engineering: 'State machine implemented in the <code>useOutlineGeneration</code> hook. Transitions are explicit; no <code>isLoading</code> boolean spaghetti. Recovery paths from <code>Failed</code> are part of the contract, not an afterthought.',
      business: 'The user can <em>always</em> recover. A failed generation routes to retry or the manual flow. No abandoned drafts and no dead ends.',
      product: 'A "manual escape hatch" is preserved at every failure state — autonomy over automation. If AI does not work for this user this time, the prototype still ships them a draft.'
    }
  },
  {
    id: 'b-affordances',
    category: 'option-b',
    title: '“Coming in full version” affordances',
    mermaid: `flowchart TD
  subgraph Brief["Brief intake screen"]
    V["🎤 Voice dictation icon"]
  end

  subgraph Editor["Outline editor"]
    C["💬 Refine with chat"]
  end

  subgraph Content["/products/:id/content"]
    L["✏️ Edit lesson body"]
  end

  V -->|hover/click| VT["'Voice dictation —<br/>connects to a Chinese<br/>open-source model in<br/>the full version.'"]
  C -->|click| CT["'Multi-turn refinement<br/>is coming in the full<br/>version. Use regenerate<br/>or edit inline for now.'"]
  L -->|hover| LT["'Edit lesson body —<br/>coming in the full<br/>version.'"]

  style VT fill:#fff7e6,stroke:#d4a017
  style CT fill:#fff7e6,stroke:#d4a017
  style LT fill:#fff7e6,stroke:#d4a017`,
    tabs: {
      engineering: 'Voice icon: tooltip plus toast on click, no API call. Chat bubble: side panel with disabled input. Lesson edit: disabled button. Three components, ~60 lines each. Zero backend.',
      business: 'These previews communicate the scope of the future product without expanding the current build. Voice dictation, multi-turn refinement, and lesson-body editing appear inline within the flow as roadmap items.',
      product: 'Specific affordances communicate exactly what is not built yet, in context. This is more honest than a generic "coming soon" badge and clarifies the boundary between current and future capability.'
    }
  },
  {
    id: 'b-erd',
    category: 'option-b',
    title: 'Data model (ER)',
    mermaid: `erDiagram
  users ||--o{ products : owns
  products ||--o{ lessons : contains
  users ||--o{ onboarding_events : emits
  users ||--o{ course_briefs : "Option B"
  course_briefs ||--o{ generations : "Option B"
  course_briefs ||--o| products : "Option B"

  users {
    text id PK
    text email
    text inferred_topic "B"
    text inferred_audience "B"
  }
  products {
    text id PK
    text user_id FK
    int price_cents
    text status
  }
  lessons {
    text id PK
    text product_id FK
    text title
    text body "B (dummy)"
    int ai_generated "B"
  }
  course_briefs {
    text id PK
    text raw_input
    text ai_mode
  }
  generations {
    text id PK
    text brief_id FK
    int latency_ms
    int cached
  }`,
    tabs: {
      engineering: '<code>course_briefs</code> and <code>generations</code> are net-new. <code>lessons</code> gains 4 columns. <code>users</code> gets 2 optional columns. <code>products</code> is unchanged — A and B produce interchangeable rows.',
      business: 'The data-model bet is conservative: A and B share a <code>products</code> table. If we ship A first then B, no migration churn. If we ship only one, no rework.',
      product: 'Inferred profile signals (<code>inferred_topic</code>, <code>inferred_audience</code>) replace the 6-step business form. Same business intelligence value, zero user friction. Ambient onboarding done right.'
    }
  },
  {
    id: 'b-gantt',
    category: 'option-b',
    title: 'Time-to-value (Gantt)',
    mermaid: `gantt
  title Option B — Time-to-value (target under 3 min)
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
  Read post-creation        :b6, after b5, 30s`,
    tabs: {
      engineering: '30s + 10s + 20s + 10s (gen) + 50s (edit) + 30s = 150s target. Generation latency is the only variable; everything else is human-paced. Streaming hides perceived latency under 1s for the first module.',
      business: '2.4 min from landing to a course with content. ~6× improvement on today. Streaming means perceived time is shorter than measured time — the user feels progress within 1 second.',
      product: 'The 50s editing budget is deliberate slack. We do not want users to <em>finish</em> in 50s; we want them to feel they can. Aesthetic-Usability Effect: a 50s window feels like a calm review, a 20s window feels like pressure.'
    }
  },

  // ---- Comparison & Roadmap -------------------------------------------------
  {
    id: 'c-density',
    category: 'compare',
    title: 'Flow density',
    mermaid: `flowchart TB
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
  style B fill:#d6f5e3,stroke:#17df87`,
    tabs: {
      engineering: 'A slide artefact, not a code artefact. Useful as a single-glance reference for gate counts. The "step" count understates the difference: B\'s step 3 is typing prose, not filling a form.',
      business: 'Step counts: 7 today, 5 in Option A, 5 in Option B. The five steps in Option B are <em>qualitatively</em> different from Option A — typing an intent rather than filling a form.',
      product: 'Step count is a vanity metric — what matters is decision count per step. Option A has fewer decisions per step; Option B replaces a form-shaped decision with a prose-shaped intent. Different category of work.'
    }
  },
  {
    id: 'c-table',
    category: 'compare',
    title: 'Cost / delivery comparison',
    mermaid: `flowchart LR
  T1["Today<br/>15+ min<br/>—"] --> A1["Option A<br/>~4.5 min<br/>~3 hours build"]
  A1 --> B1["Option B<br/>~2.4 min<br/>~4.5 hours build"]

  style T1 fill:#fde2e2,stroke:#c0392b
  style A1 fill:#fff7e6,stroke:#d4a017
  style B1 fill:#d6f5e3,stroke:#17df87`,
    tabs: {
      engineering: 'Build-cost estimates (~3h, ~4.5h) include scaffold reuse from A → B. Net new for B: ~1.5h. Test coverage included. Numbers are conservative for an experienced engineer pairing with the existing scaffold.',
      business: '4.5 hours of build for a 6× improvement on time-to-value. If the team ships Option A first (~3 hours), the incremental cost of Option B is approximately 1.5 hours; the phased delivery has near-zero overhead.',
      product: 'Option B\'s fixture mode means the experience never depends on a live API; it runs offline and reproducibly. The remaining risk is whether the AI output feels coherent, which is addressed by hand-curating the 6 fixtures.'
    }
  },
  {
    id: 'c-roadmap',
    category: 'compare',
    title: 'Phased roadmap',
    mermaid: `gantt
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
  Ship to production      :milestone, after b3, 0d`,
    tabs: {
      engineering: 'Sequencing matters: A\'s scaffold (auth, dashboard, components, tokens) must land before B\'s flow can be added. B is purely additive after A. No throwaway code in either phase.',
      business: 'Hotfix next sprint, structural fix next quarter. Option A addresses the immediate signup-friction problem; Option B addresses the underlying cold-start problem. Sequencing the two avoids reworking either.',
      product: 'Phased delivery produces measurable learning between A and B. If Option A\'s activation lift exceeds expectations, the scope of Option B can be reduced. If it underperforms, Option B becomes the higher priority.'
    }
  }
];

// -----------------------------------------------------------------------------
// Build the overview "map" — a Mermaid flowchart with clickable nodes per diagram.
// -----------------------------------------------------------------------------

function buildOverviewMap() {
  // Mermaid 10.x flowchart node/subgraph IDs cannot contain hyphens — sanitize
  // for the diagram while keeping the original IDs for routing.
  const sanitize = (s) => s.replace(/-/g, '_');
  // Mermaid uses the literal "..." as a label delimiter, so any inner quotes
  // must be replaced with typographic equivalents to keep the parser happy.
  const labelSafe = (s) => s.replace(/"/g, '”');
  const lines = ['flowchart LR'];
  for (const cat of categories) {
    const catDiagrams = diagrams.filter((d) => d.category === cat.id);
    if (catDiagrams.length === 0) continue;
    const sgId = sanitize(cat.id);
    lines.push(`  subgraph ${sgId}["${labelSafe(cat.label)}"]`);
    for (const d of catDiagrams) {
      lines.push(`    ${sanitize(d.id)}["${labelSafe(d.title)}"]`);
    }
    lines.push('  end');
    lines.push(`  style ${sgId} fill:${cat.tint},stroke:${cat.stroke}`);
  }
  // Click bindings — Mermaid invokes window.openDiagram with the original id.
  for (const d of diagrams) {
    lines.push(`  click ${sanitize(d.id)} call openDiagram("${d.id}")`);
  }
  return lines.join('\n');
}

const overviewMap = buildOverviewMap();

// -----------------------------------------------------------------------------
// HTML generator
// -----------------------------------------------------------------------------

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const escapeJsonForScript = (obj) =>
  JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');

const payload = {
  categories,
  diagrams,
  overviewMap
};

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Case study — diagrams preview</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
  <style>
    :root {
      --color-bg: #ffffff;
      --color-surface: #f7f8fa;
      --color-border: #d7dadf;
      --color-border-soft: #f3f5f8;
      --color-text: #1a1d21;
      --color-muted: #6c757d;
      --color-accent: #17df87;
      --color-accent-soft: #d6f5e3;
      --color-accent-dark: #14c879;
      --radius-sm: 6px;
      --radius-md: 8px;
      --radius-lg: 12px;
      --radius-xl: 16px;
      --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
      --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.06);
      --shadow-lg: 0 12px 32px rgba(0, 0, 0, 0.10);
      --space-1: 4px;
      --space-2: 8px;
      --space-3: 12px;
      --space-4: 16px;
      --space-5: 24px;
      --space-6: 32px;
      --space-7: 48px;
      --space-8: 64px;
    }

    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }

    body {
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      color: var(--color-text);
      background: var(--color-bg);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    header.topbar {
      position: sticky;
      top: 0;
      z-index: 20;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border-bottom: 1px solid var(--color-border);
      padding: var(--space-4) var(--space-6);
      display: flex;
      align-items: center;
      gap: var(--space-4);
    }

    header.topbar .brand {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      font-weight: 600;
      font-size: 14px;
    }

    header.topbar .brand-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--color-accent);
    }

    header.topbar nav {
      flex: 1;
      display: flex;
      gap: var(--space-2);
      align-items: center;
    }

    header.topbar .crumb {
      font-size: 13px;
      color: var(--color-muted);
    }

    header.topbar .crumb a {
      color: var(--color-text);
      text-decoration: none;
    }

    header.topbar .crumb a:hover {
      text-decoration: underline;
      text-decoration-color: var(--color-accent);
      text-underline-offset: 3px;
    }

    header.topbar .actions {
      display: flex;
      gap: var(--space-2);
    }

    .btn {
      font-family: inherit;
      font-size: 13px;
      font-weight: 500;
      padding: var(--space-2) var(--space-4);
      background: var(--color-bg);
      color: var(--color-text);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: background 150ms ease-out, border-color 150ms ease-out;
    }

    .btn:hover { background: var(--color-surface); }
    .btn:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    .btn.primary {
      background: var(--color-accent);
      border-color: var(--color-accent);
      color: #ffffff;
    }
    .btn.primary:hover { background: var(--color-accent-dark); border-color: var(--color-accent-dark); }

    main {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-7) var(--space-6);
    }

    .page-header {
      margin-bottom: var(--space-7);
    }

    .page-header h1 {
      font-size: 32px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: 0 0 var(--space-2) 0;
    }

    .page-header p {
      color: var(--color-muted);
      font-size: 15px;
      margin: 0;
      max-width: 720px;
    }

    /* ---- Overview map ---- */
    .overview-map {
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
      margin-bottom: var(--space-7);
      overflow-x: auto;
    }

    .overview-map h2 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-muted);
      margin: 0 0 var(--space-4) 0;
    }

    .overview-map .mermaid svg {
      max-width: 100%;
      height: auto;
      cursor: default;
    }

    .overview-map .mermaid .node[id*="flowchart"] { cursor: pointer; }

    .overview-map .map-hint {
      margin-top: var(--space-3);
      color: var(--color-muted);
      font-size: 13px;
    }

    /* ---- Category sections ---- */
    .category {
      margin-bottom: var(--space-7);
    }

    .category-header {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      margin-bottom: var(--space-4);
    }

    .category-stripe {
      width: 4px;
      height: 24px;
      border-radius: var(--radius-sm);
    }

    .category-header h2 {
      font-size: 18px;
      font-weight: 600;
      margin: 0;
    }

    .category-header .count {
      color: var(--color-muted);
      font-size: 13px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-4);
    }

    .card {
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      cursor: pointer;
      transition: border-color 150ms ease-out, transform 150ms ease-out, box-shadow 150ms ease-out;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      text-align: left;
      font-family: inherit;
      color: var(--color-text);
      position: relative;
      overflow: hidden;
    }

    .card::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--card-stripe, var(--color-border));
    }

    .card:hover {
      border-color: var(--color-text);
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .card:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    .card .card-title {
      font-size: 15px;
      font-weight: 600;
      margin: 0;
    }

    .card .card-meta {
      font-size: 12px;
      color: var(--color-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .card .card-tab-row {
      display: flex;
      gap: var(--space-2);
      margin-top: auto;
      padding-top: var(--space-3);
      border-top: 1px solid var(--color-border-soft);
    }

    .card .card-tab-row span {
      font-size: 11px;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      color: var(--color-muted);
      font-weight: 500;
    }

    /* ---- Detail view ---- */
    .detail {
      display: none;
    }

    .detail.active {
      display: block;
    }

    .overview {
      display: block;
    }

    .overview.hidden {
      display: none;
    }

    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      margin-bottom: var(--space-5);
      flex-wrap: wrap;
    }

    .detail-header .meta {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .category-badge {
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
      font-size: 12px;
      font-weight: 500;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--badge-stroke, var(--color-border));
      background: var(--badge-tint, var(--color-surface));
      color: var(--color-text);
    }

    .detail h1 {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin: var(--space-3) 0 var(--space-5) 0;
    }

    .diagram-container {
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      padding: var(--space-6);
      box-shadow: var(--shadow-sm);
      margin-bottom: var(--space-6);
      overflow-x: auto;
      text-align: center;
    }

    .diagram-container svg {
      max-width: 100%;
      height: auto;
    }

    /* ---- Tabs ---- */
    .tabs {
      background: var(--color-bg);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .tab-strip {
      display: flex;
      gap: 0;
      border-bottom: 1px solid var(--color-border);
      padding: 0 var(--space-3);
      background: var(--color-surface);
    }

    .tab-button {
      font-family: inherit;
      font-size: 14px;
      font-weight: 500;
      padding: var(--space-4) var(--space-5);
      background: transparent;
      color: var(--color-muted);
      border: none;
      border-bottom: 2px solid transparent;
      cursor: pointer;
      transition: color 150ms ease-out, border-color 150ms ease-out;
      display: inline-flex;
      align-items: center;
      gap: var(--space-2);
    }

    .tab-button:hover {
      color: var(--color-text);
    }

    .tab-button[aria-selected="true"] {
      color: var(--color-text);
      border-bottom-color: var(--color-accent);
      font-weight: 600;
    }

    .tab-button:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: -2px;
      border-radius: var(--radius-sm);
    }

    .tab-button-icon {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: var(--tab-color, var(--color-border));
      display: inline-block;
    }

    .tab-panel {
      padding: var(--space-6);
      font-size: 14px;
      line-height: 1.7;
    }

    .tab-panel[hidden] { display: none; }

    .tab-panel code {
      font-family: 'JetBrains Mono', ui-monospace, monospace;
      font-size: 0.9em;
      background: var(--color-border-soft);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
    }

    .tab-panel em {
      font-style: italic;
      color: var(--color-text);
    }

    .tab-panel .audience-label {
      display: inline-block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--color-muted);
      font-weight: 600;
      margin-bottom: var(--space-2);
    }

    /* ---- Print mode ---- */
    @media print {
      header.topbar, .actions { display: none; }
      .overview { display: block !important; }
      .detail { display: block !important; page-break-before: always; }
      .tab-panel[hidden] { display: block !important; }
      .tab-strip { border-bottom: none; }
      .tab-button { display: none; }
      .tab-panel::before {
        content: attr(data-audience-label);
        display: block;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #6c757d;
        font-weight: 600;
        margin-bottom: 8px;
      }
    }

    @media (max-width: 720px) {
      header.topbar { padding: var(--space-3) var(--space-4); flex-wrap: wrap; }
      main { padding: var(--space-5) var(--space-4); }
      .grid { grid-template-columns: 1fr; }
      .tab-button { padding: var(--space-3) var(--space-3); font-size: 13px; }
    }

    @media (prefers-reduced-motion: reduce) {
      * { transition: none !important; animation: none !important; }
    }
  </style>
</head>
<body>
  <header class="topbar">
    <div class="brand">
      <span class="brand-dot" aria-hidden="true"></span>
      <span>ablefy case study · diagrams</span>
    </div>
    <nav>
      <span class="crumb"><a href="#/" id="crumb-home">Overview</a><span id="crumb-current"></span></span>
    </nav>
    <div class="actions">
      <button class="btn" id="btn-print" type="button">Print / PDF</button>
    </div>
  </header>

  <main>
    <!-- Overview view -->
    <section id="overview" class="overview" aria-label="Diagram overview">
      <div class="page-header">
        <h1>Case study — diagrams &amp; user flows</h1>
        <p>Supporting materials for the ablefy onboarding redesign. Click any diagram on the map or in the grid below to see the diagram with audience-specific notes for engineering, business, and product readers.</p>
      </div>

      <div class="overview-map">
        <h2>Map</h2>
        <pre class="mermaid" id="overview-map">${escapeHtml(overviewMap)}</pre>
        <p class="map-hint">Click a node above to open the diagram, or browse by category below.</p>
      </div>

      <div id="categories"></div>
    </section>

    <!-- Detail view -->
    <section id="detail" class="detail" aria-label="Diagram detail" aria-live="polite"></section>
  </main>

  <script type="application/json" id="payload">${escapeJsonForScript(payload)}</script>

  <script type="module">
    import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@10.9.1/dist/mermaid.esm.min.mjs';

    const data = JSON.parse(document.getElementById('payload').textContent);
    const { categories, diagrams, overviewMap } = data;

    const categoryById = Object.fromEntries(categories.map((c) => [c.id, c]));

    const audiences = [
      { key: 'engineering', label: 'Engineering', color: '#2d62c4' },
      { key: 'business', label: 'Business', color: '#17df87' },
      { key: 'product', label: 'Product', color: '#d4a017' }
    ];

    // Expose the click-handler that Mermaid's "call" directives invoke.
    window.openDiagram = (id) => { location.hash = '#/d/' + id; };

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'loose',
      theme: 'base',
      fontFamily: 'Inter, system-ui, sans-serif',
      themeVariables: {
        primaryColor: '#ffffff',
        primaryTextColor: '#1a1d21',
        primaryBorderColor: '#17df87',
        lineColor: '#6c757d',
        secondaryColor: '#f7f8fa',
        tertiaryColor: '#ffffff',
        fontSize: '13px',
        background: '#ffffff'
      }
    });

    const overviewSection = document.getElementById('overview');
    const detailSection = document.getElementById('detail');
    const crumbCurrent = document.getElementById('crumb-current');

    // Build the categorized grid below the map.
    const categoriesHost = document.getElementById('categories');
    for (const cat of categories) {
      const catDiagrams = diagrams.filter((d) => d.category === cat.id);
      if (catDiagrams.length === 0) continue;

      const wrap = document.createElement('section');
      wrap.className = 'category';

      const header = document.createElement('div');
      header.className = 'category-header';
      header.innerHTML =
        '<span class="category-stripe" style="background:' + cat.stroke + '"></span>' +
        '<h2>' + cat.label + '</h2>' +
        '<span class="count">' + catDiagrams.length + ' diagram' + (catDiagrams.length === 1 ? '' : 's') + '</span>';
      wrap.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'grid';

      for (const d of catDiagrams) {
        const card = document.createElement('button');
        card.type = 'button';
        card.className = 'card';
        card.style.setProperty('--card-stripe', cat.stroke);
        card.addEventListener('click', () => { location.hash = '#/d/' + d.id; });
        card.innerHTML =
          '<span class="card-meta">' + cat.label + '</span>' +
          '<h3 class="card-title">' + d.title + '</h3>' +
          '<div class="card-tab-row">' +
            '<span>Engineering</span>' +
            '<span>Business</span>' +
            '<span>Product</span>' +
          '</div>';
        grid.appendChild(card);
      }
      wrap.appendChild(grid);
      categoriesHost.appendChild(wrap);
    }

    // Render the overview map.
    let mapRendered = false;
    async function renderMap() {
      if (mapRendered) return;
      try {
        await mermaid.run({ querySelector: '#overview-map' });
        mapRendered = true;
      } catch (err) {
        console.error('Map render error:', err);
      }
    }

    // Render a detail view for a diagram.
    async function renderDetail(id) {
      const d = diagrams.find((x) => x.id === id);
      if (!d) {
        location.hash = '#/';
        return;
      }
      const cat = categoryById[d.category];

      detailSection.innerHTML =
        '<div class="detail-header">' +
          '<div class="meta">' +
            '<a class="btn" href="#/" aria-label="Back to overview">← Back</a>' +
            '<span class="category-badge" style="--badge-stroke:' + cat.stroke + ';--badge-tint:' + cat.tint + '">' + cat.label + '</span>' +
          '</div>' +
        '</div>' +
        '<h1>' + d.title + '</h1>' +
        '<div class="diagram-container">' +
          '<pre class="mermaid" id="diagram-source">' + escapeHtml(d.mermaid) + '</pre>' +
        '</div>' +
        buildTabs(d);

      crumbCurrent.innerHTML = ' › <strong>' + d.title + '</strong>';

      try {
        await mermaid.run({ querySelector: '#diagram-source' });
      } catch (err) {
        console.error('Diagram render error:', err);
      }

      wireTabs();
      window.scrollTo({ top: 0, behavior: 'instant' });
    }

    function buildTabs(d) {
      const buttons = audiences.map((a, i) =>
        '<button role="tab"' +
          ' id="tab-' + a.key + '"' +
          ' aria-controls="panel-' + a.key + '"' +
          ' aria-selected="' + (i === 0 ? 'true' : 'false') + '"' +
          ' tabindex="' + (i === 0 ? '0' : '-1') + '"' +
          ' class="tab-button"' +
          ' style="--tab-color:' + a.color + '"' +
        '>' +
          '<span class="tab-button-icon" aria-hidden="true"></span>' +
          a.label +
        '</button>'
      ).join('');

      const panels = audiences.map((a, i) =>
        '<div role="tabpanel"' +
          ' id="panel-' + a.key + '"' +
          ' class="tab-panel"' +
          ' aria-labelledby="tab-' + a.key + '"' +
          ' data-audience-label="For ' + a.label + '"' +
          ' tabindex="0"' +
          (i === 0 ? '' : ' hidden') +
        '>' +
          '<span class="audience-label">For ' + a.label + '</span>' +
          '<p>' + d.tabs[a.key] + '</p>' +
        '</div>'
      ).join('');

      return (
        '<div class="tabs">' +
          '<div role="tablist" class="tab-strip" aria-label="Audience-specific notes">' + buttons + '</div>' +
          panels +
        '</div>'
      );
    }

    function wireTabs() {
      const tablist = detailSection.querySelector('[role="tablist"]');
      if (!tablist) return;
      const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));

      function selectTab(target) {
        for (const t of tabs) {
          const selected = t === target;
          t.setAttribute('aria-selected', selected ? 'true' : 'false');
          t.setAttribute('tabindex', selected ? '0' : '-1');
          const panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) panel.hidden = !selected;
        }
        target.focus();
      }

      tabs.forEach((tab) => {
        tab.addEventListener('click', () => selectTab(tab));
        tab.addEventListener('keydown', (e) => {
          const idx = tabs.indexOf(tab);
          if (e.key === 'ArrowRight') {
            e.preventDefault();
            selectTab(tabs[(idx + 1) % tabs.length]);
          } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            selectTab(tabs[(idx - 1 + tabs.length) % tabs.length]);
          } else if (e.key === 'Home') {
            e.preventDefault();
            selectTab(tabs[0]);
          } else if (e.key === 'End') {
            e.preventDefault();
            selectTab(tabs[tabs.length - 1]);
          }
        });
      });
    }

    function escapeHtml(s) {
      return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Hash router: '' or '#/' → overview, '#/d/<id>' → detail.
    async function route() {
      const hash = location.hash || '#/';
      if (hash.startsWith('#/d/')) {
        overviewSection.classList.add('hidden');
        detailSection.classList.add('active');
        const id = hash.slice('#/d/'.length);
        await renderDetail(id);
      } else {
        detailSection.classList.remove('active');
        detailSection.innerHTML = '';
        overviewSection.classList.remove('hidden');
        crumbCurrent.innerHTML = '';
        await renderMap();
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    }

    window.addEventListener('hashchange', route);
    document.getElementById('btn-print').addEventListener('click', () => window.print());

    // Kick off.
    route();
  </script>
</body>
</html>
`;

writeFileSync(target, html);
console.log(`Wrote ${target}`);
console.log(`Open with: open ${target}`);
