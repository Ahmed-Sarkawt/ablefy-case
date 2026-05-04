# Plan — Option 02 Prototype (AI Course Creator)

> **Scope:** Ambitious sibling to Option 01. Replaces the manual product-creation form with an AI-mediated brief → outline → draft pipeline that doubles as ambient onboarding.
> **Stack:** Same as Option 01 (React 18 + TS + Vite + Tailwind · Hono + better-sqlite3 · Vitest + Playwright), plus `@anthropic-ai/sdk` gated behind a feature flag.
> **Goal:** Collapse Blocker 1 (signup friction) and Blocker 2 (cold-start course-builder) into a single flow. Time-to-first-draft-course **under 3 minutes**.

## Relationship to Option 01

Option 02 is an **alternative**, not a replacement. Both options are designed to coexist in the codebase: a course is still a row in `products` with `status='draft'`, and the dashboard, auth, and persistence layers from Option 01 are reused unchanged. The difference is the path between signup and a draft course.

| Option 01 fix | Carries over? | Notes |
|---|---|---|
| 3-field signup | **Yes** | Reused verbatim. |
| Dashboard simplification (compliance moved to Settings) | **Yes** | Reused verbatim. |
| Single-page manual product form (`/products/new`) | **Superseded** | Replaced by `/products/new/ai`. The manual form remains accessible behind an "I'd rather build it manually" link for users who reject the AI flow. |
| Post-creation screen with primary "Add Course Content" | **Yes, augmented** | Same shape; the secondary action set gains "Regenerate outline" while the user is still mid-refinement. |
| Contextual prompts in the editor | **Yes** | The AI flow seeds the editor; contextual prompts remain for empty modules. |

**The two options share a database.** A user who runs through Option 02 ends up with the same `products` + `lessons` rows that Option 01 produces — just generated, not hand-typed. This means a downstream content editor (out of scope for both) can be built once.

## What we're building

A working prototype that demonstrates the AI course-creation flow. Users can:
- Sign up with the same minimal 3-field form
- Land on the same redesigned dashboard
- Click "Create with AI" and describe a course in 1–3 sentences
- Watch an outline (modules → lessons) generate, then accept, edit inline, or regenerate per module
- See a `status='draft'` course persist with AI-generated descriptions, suggested duration, and a defensible price
- Land on the same post-creation screen Option 01 produces

All AI calls are feature-flagged. By default the prototype runs with **deterministic fixtures** so the demo is reproducible offline. A live mode is available behind `VITE_AI_MODE=live` + `ANTHROPIC_API_KEY`.

## What we are not building

- **Real** authoring tools for the lesson body. The AI generates a **dummy lesson body** (3–6 paragraphs of plausible markdown content per lesson) so the prototype *feels* like a complete solution end-to-end — but actual editing of that body is still out of scope. The body is read-only in the prototype, with a "Coming in full version — edit lesson body" affordance.
- Streaming over WebSockets. We use HTTP streaming via Server-Sent Events (already supported by Hono) to keep the stack thin.
- **Real** multi-turn refinement. A chatbot affordance is present in the outline editor; clicking it opens a panel that says *"Multi-turn refinement is coming in the full version — for now, use the regenerate button or edit inline."* This previews the future behavior without building it.
- **Real** voice dictation. A microphone icon next to the brief textarea is present and focusable, with a tooltip on hover/focus: *"Voice dictation — connects to a Chinese open-source model in the full version."* Click is a no-op that surfaces the same tooltip as a toast.
- Real cost telemetry / billing pages.
- Multi-language generation. English only for the prototype; ablefy's dual-language fields are mocked (German fields autopopulated as `{title} (DE)` placeholders so the dual-language data path is exercised).
- Online/hosted deployment. If someone accesses a hosted copy, a top banner reads *"This is a local-only test version of the prototype — please clone and run it offline for the full demo."*

## The three structural moves

| # | Current ablefy | Option 02 | Issue resolved |
|---|---|---|---|
| 1 | 6-step business-form gate before any product work | The brief intake (`"What do you want to teach?"`) replaces the gate. Audience, topic, and price-range signals are *inferred* from the brief and stored on the user profile silently. | #1, #3 |
| 2 | Blank page-builder cold start | One-shot AI outline generation with inline accept/edit/regenerate per module. | #5, #10 |
| 3 | Equal-weight post-creation actions | Inherits Option 01's hierarchy (one primary "Add Course Content"); gains a "Regenerate outline" affordance during the *first* edit session. | #9 |

## Architecture deltas vs Option 01

```
prototype/
├── src/
│   ├── routes/
│   │   ├── products.new.ai.tsx         NEW — brief intake + outline editor
│   │   └── (everything else from Option 01 unchanged)
│   ├── components/
│   │   ├── BriefForm.tsx               NEW
│   │   ├── OutlineEditor.tsx           NEW
│   │   ├── ModuleCard.tsx              NEW
│   │   └── GenerationStatus.tsx        NEW
│   ├── hooks/
│   │   └── useOutlineGeneration.ts     NEW — manages SSE stream + state
│   └── lib/
│       └── ai.client.ts                NEW — typed fetch wrapper for /api/ai/*
├── server/
│   ├── lib/
│   │   ├── ai.ts                       NEW — provider abstraction
│   │   ├── ai.fixtures.ts              NEW — deterministic outlines for dev/test
│   │   ├── ai.live.ts                  NEW — Anthropic SDK call w/ prompt caching
│   │   └── prompts.ts                  NEW — system + user prompt templates
│   └── routes/
│       └── ai.ts                       NEW — /api/ai/outline (SSE), /api/ai/regenerate
└── tests/
    ├── unit/                           +ai.fixtures, +prompt assembly
    ├── integration/                    +ai endpoints (fixture mode only)
    └── e2e/                            +full AI flow run (fixture mode)
```

Option 01's scaffold (Vite, Tailwind, tokens, Hono, SQLite, motion primitives, code-reviewer agent) is reused without change. The new code is additive.

## Data model deltas

Migration: `prototype/server/db/migrations/002_option_02_ai.sql` (Option 01 owns `001`).

```sql
-- Stores the raw user brief and any inferred profile signals.
CREATE TABLE IF NOT EXISTS course_briefs (
  id              TEXT PRIMARY KEY,                       -- UUID v4
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id      TEXT REFERENCES products(id) ON DELETE SET NULL,  -- nullable until accept
  raw_input       TEXT NOT NULL,                          -- the user's 1–3 sentence brief
  inferred_topic  TEXT,                                   -- e.g. "Sora 2 for branded content"
  inferred_audience TEXT,                                 -- e.g. "mid-level creators"
  suggested_price_cents INTEGER,
  ai_mode         TEXT NOT NULL CHECK (ai_mode IN ('fixture', 'live')),
  created_at      INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_briefs_user ON course_briefs(user_id);

-- Audit table: every generation (initial + regenerations).
CREATE TABLE IF NOT EXISTS generations (
  id              TEXT PRIMARY KEY,
  brief_id        TEXT NOT NULL REFERENCES course_briefs(id) ON DELETE CASCADE,
  scope           TEXT NOT NULL CHECK (scope IN ('outline', 'module', 'lesson')),
  scope_target_id TEXT,                                   -- module/lesson id when scoped
  prompt_hash     TEXT NOT NULL,                          -- sha256 of assembled prompt
  output_json     TEXT NOT NULL,                          -- raw structured output
  model           TEXT NOT NULL,                          -- e.g. 'claude-haiku-4-5'
  latency_ms      INTEGER NOT NULL,
  cached          INTEGER NOT NULL DEFAULT 0,             -- 1 if served from prompt cache
  created_at      INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000)
);

CREATE INDEX IF NOT EXISTS idx_gens_brief ON generations(brief_id, created_at);

-- Lessons table additions:
ALTER TABLE lessons ADD COLUMN ai_generated INTEGER NOT NULL DEFAULT 0;
ALTER TABLE lessons ADD COLUMN source_brief_id TEXT REFERENCES course_briefs(id) ON DELETE SET NULL;
ALTER TABLE lessons ADD COLUMN suggested_duration_min INTEGER;
ALTER TABLE lessons ADD COLUMN description TEXT;          -- short blurb shown in outline

-- Users table additions (ambient onboarding signals, all optional):
ALTER TABLE users ADD COLUMN inferred_topic TEXT;
ALTER TABLE users ADD COLUMN inferred_audience TEXT;
```

`onboarding_events` adds these event types (no schema change — `event_type` is free-form):

| event_type | attributes |
|---|---|
| `brief_submitted` | `brief_length`, `ai_mode` |
| `outline_generated` | `module_count`, `lesson_count`, `latency_ms`, `cached` |
| `module_regenerated` | `module_index`, `latency_ms` |
| `lesson_edited_inline` | `lesson_id`, `field` |
| `outline_accepted` | `time_since_brief_ms`, `module_count`, `lesson_count`, `edits_made` |

Time-to-value is now `time(outline_accepted) - time(signup_completed)`.

## AI architecture

### Provider abstraction

`prototype/server/lib/ai.ts` exposes two functions:

```ts
export interface OutlineRequest {
  brief: string;
  userId: string;
}

export interface Outline {
  briefId: string;
  inferredTopic: string;
  inferredAudience: string;
  suggestedPriceCents: number;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  summary: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  durationMin: number;
  body: string;            // dummy markdown body, 3–6 paragraphs, generated alongside the outline
}

export function generateOutline(req: OutlineRequest, opts: { signal?: AbortSignal }): AsyncIterable<OutlineEvent>;
export function generateLessonDraft(outline: Outline, lessonId: string): Promise<{ description: string; durationMin: number }>;
```

`OutlineEvent` is a discriminated union: `{ type: 'topic', value: string }`, `{ type: 'module', module: Module }`, `{ type: 'done', outline: Outline }`, `{ type: 'error', message: string }`. Iterating consumes events as the model produces them.

### Two backends, one interface

- `ai.fixtures.ts` reads from `prototype/server/lib/fixtures/outlines.json` keyed by a hash of the brief's first 32 chars. Falls back to a generic "creator economy" template. Yields events with a `~50ms` delay between modules to simulate streaming. **This is the default in dev and the only mode used in tests.**
- `ai.live.ts` calls Anthropic's SDK with **prompt caching enabled** (system prompt + outline schema cached as a single `cache_control` block). Streams via the SDK's `stream()` helper and translates content blocks into `OutlineEvent`s.

The live backend is selected at request time by reading `process.env.AI_MODE`. If `live` and no key is present, the route returns a 503 with a specific error code so the UI can show a degraded-state banner instead of crashing.

### Model choice — Claude Haiku 4.5

The plan picks **Haiku 4.5** over Sonnet 4.6 because:

1. **Latency dominates the demo.** A 10-minute hiring review will not tolerate a 6-second wait; Haiku reliably returns a 5-module outline in under 2 seconds.
2. **The task is structured, not subtle.** Generating a course outline from a 1–3 sentence brief is well within Haiku's competence — we are not asking for taste-level prose.
3. **Cost.** Even with a live demo running 20 generations during interview prep, Haiku stays under $0.10. Sonnet would be ~5× that for negligible quality gain on this task.
4. **Prompt caching.** The system prompt + outline schema are cached, so the per-request input cost collapses to the brief itself plus a tiny overhead.

If a live reviewer notices the outline feels "thin," the env var `AI_MODEL=claude-sonnet-4-6` swaps it in without code changes — the abstraction is provider/model agnostic.

### Prompt caching (mandatory per project skill)

The `claude-api` skill enforces prompt caching on any code using the Anthropic SDK. The structure:

```
[system block, cache_control: ephemeral] — role description + output schema (~600 tokens)
[user block]                              — the brief (~50 tokens)
```

This means after the first call the system block is served from cache (90% input-token discount). The `generations` audit table records `cached=1` when the response includes `cache_read_input_tokens > 0`, which the slide deck can show as proof the caching is real.

### Streaming end-to-end

Browser → Hono `/api/ai/outline` (POST, returns `text/event-stream`) → SDK `stream()` → SSE chunks → React `EventSource` → `useOutlineGeneration` hook → `<OutlineEditor>` consumes incrementally.

Server-side, the route shape:

```ts
app.post('/api/ai/outline', authMiddleware, async (c) => {
  const { brief } = await c.req.json();
  return streamSSE(c, async (stream) => {
    for await (const ev of generateOutline({ brief, userId: c.var.userId })) {
      await stream.writeSSE({ event: ev.type, data: JSON.stringify(ev) });
    }
  });
});
```

Hono ships `streamSSE` natively. No new dependency.

## Flow

### Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                                                                      │
│  /signup                  /dashboard            /products/new/ai     │
│  ┌──────────┐            ┌──────────┐          ┌──────────────────┐  │
│  │ Name     │  ───────►  │ Create   │  ─────►  │ "What do you     │  │
│  │ Email    │            │ with AI  │          │  want to teach?" │  │
│  │ Password │            │ [primary]│          │  ┌────────────┐  │  │
│  └──────────┘            │          │          │  │ textarea   │  │  │
│   30 seconds              │ Manual   │          │  └────────────┘  │  │
│   (Option 01 reused)      │ [link]   │          │   Generate       │  │
│                           └──────────┘          └──────────────────┘  │
│                            10 seconds            20 seconds (typing)  │
│                                                       │               │
│                                                       ▼               │
│  /products/:id/created    (same /products/new/ai screen)              │
│  ┌──────────┐            ┌────────────────────────────────────┐       │
│  │ ✓ Course │  ◄───────  │ Outline streams in:                │       │
│  │   ready! │            │   Module 1: Foundations  ▾         │       │
│  │ ──────── │            │     • Lesson 1.1 …  [edit]         │       │
│  │ [Add     │            │     • Lesson 1.2 …  [edit]         │       │
│  │  Content]│            │   Module 2: …       [regenerate]   │       │
│  │ More ▾   │            │   Module 3: …                      │       │
│  └──────────┘            │                                    │       │
│                          │ [Looks good — create draft]        │       │
│                          └────────────────────────────────────┘       │
│   30 seconds              ~60 seconds (10s gen + 50s review/edit)     │
│                                                                       │
│  Total target: under 3 minutes                                        │
└───────────────────────────────────────────────────────────────────────┘
```

### Step 1 — Signup (`/signup`)

Identical to Option 01. 30-second target. Emits `signup_completed`.

### Step 2 — Dashboard (`/dashboard`)

Identical to Option 01 with one change: the primary card's CTA reads **"Create with AI"** (green). A small secondary link below it reads "or start from scratch →" pointing to `/products/new` (the Option 01 manual flow). 10-second target. Emits `create_clicked` with `attributes.path='ai'|'manual'`.

**Hick's Law justification:** offering exactly two paths (AI primary, manual escape hatch) keeps the choice cost low while honoring the user's autonomy. A third option would dilute the primary path.

### Step 3 — Brief intake (`/products/new/ai`, top half)

**Target time:** 20 seconds.

**UI:**
- Large heading: "What do you want to teach?"
- One-sentence helper: "A few sentences is enough — we'll draft an outline you can edit."
- Multi-line textarea, 4 rows, autofocused. Placeholder: *"e.g. I want to teach mid-level creators how to use Sora 2 for branded content — 8 weeks, intermediate level."*
- **Voice-dictation icon** (microphone, 20px, `color-muted`) anchored top-right inside the textarea. Tooltip on hover/focus: *"Voice dictation — connects to a Chinese open-source model in the full version."* Click triggers the same message as a toast. Keyboard-focusable (`tabIndex=0`), `aria-label` matches the tooltip.
- Below the textarea, **example brief chips** (count TBD — see Open Questions). Click prefills the textarea. **(Aesthetic-Usability + Recognition over recall.)**
- One primary button: **"Generate outline"** (green, large). Disabled until ≥ 20 chars.
- One quiet secondary link: "I'd rather build it manually" → routes to `/products/new`.

**Validation:** 20 ≤ length ≤ 1000 chars. Inline error with `aria-describedby`.

**Success criterion:** POST to `/api/ai/outline`. Emit `brief_submitted`. UI transitions to the streaming view.

### Step 4 — Outline streaming + editing (`/products/new/ai`, bottom half)

**Target time:** 60 seconds (10s generation + 50s review).

**Generation phase (~2–10 seconds depending on mode):**
- The brief textarea collapses to a one-line summary at the top with an "Edit brief" link.
- Below, a `<GenerationStatus>` block shows a shimmer placeholder for 3 modules.
- As SSE events arrive, modules pop into the list one by one. Each module fades+slides in from below (`opacity 0 → 1, translateY(8px) → 0`, 200ms, ease-out).

**Review phase:**
- Each module renders as a card with: title, summary, and a list of lessons (title + duration + 1-line description).
- **Per-module actions** (icon buttons on the right of the module header):
  - **Regenerate this module** (refresh icon) — calls `/api/ai/regenerate` scoped to the module. Replaces just that card.
  - **Delete module** (trash icon) — removes locally, no server call.
- **Per-lesson actions** (visible on hover, keyboard-focusable):
  - Inline title editing (click → contenteditable, Enter to commit).
  - Inline duration editing (click duration → number input).
  - Delete lesson.
- A persistent footer bar with two buttons: **"Looks good — create draft"** (primary, green) and **"Start over"** (secondary, returns to brief).
- **Refine-with-chat affordance.** A floating chat-bubble icon (bottom-right, 48px, brand green) labelled *"Refine with chat"*. Click opens a side panel pre-populated with one assistant message: *"Multi-turn refinement is coming in the full version. For now, use the regenerate button on a module or edit any title and description inline."* The panel has a disabled input (placeholder: *"Coming soon"*) and a single "Got it" button that dismisses the panel. The icon remains visible on subsequent visits with a small `Soon` pill.

**Doherty Threshold justification:** streaming the outline as it generates keeps the user engaged below the 400ms attention threshold even when the full generation takes 6+ seconds.

**Hick's Law justification:** the only generation-control is "regenerate this module" (not 5 different "make it shorter / make it punchier / change the tone" buttons). One button keeps cognitive load low; if the regenerated module is also wrong, the user edits inline.

**Success criterion:** Click "Looks good" → server inserts `products` row + N `lessons` rows + finalizes `course_briefs` + emits `outline_accepted` with edit count. Redirect to `/products/:id/created`.

### Step 5 — Product created (`/products/:id/created`)

Identical to Option 01 (same component reused). 30-second target. Emits `post_creation_action`.

The primary "Add Course Content" CTA on this screen now navigates to `/products/:id/content` (a real route in Option 02, not a placeholder), where the AI-generated dummy lesson bodies are visible in a read-only viewer with the affordance: *"Edit lesson body — coming in the full version."*

### Step 6 — Course content viewer (`/products/:id/content`, prototype-only)

**Target time:** 60 seconds (skim).

**UI:**
- Left rail: module → lesson tree (collapsible).
- Main pane: selected lesson body rendered from markdown (read-only). Title, duration, description at top; body below.
- Subtle banner above the body: *"Lesson body is AI-generated and read-only in this prototype. Editing arrives in the full version."*
- Each lesson has a disabled "Edit lesson" button on the right rail with the same hover tooltip.

**Why this exists:** the case-study reviewer should be able to walk the entire flow and *see what a finished course feels like*, not just the outline. Generating a dummy body alongside the outline costs us roughly +600 tokens per lesson — negligible — and turns "AI drafts the outline" into "AI drafts the whole thing, you edit later."

### Time-to-value measurement

`time(outline_accepted) - time(signup_completed)` is the headline metric. Displayed on `/dev/metrics` (already a hidden Option 01 route).

## UI pattern decisions

### Outline editor visual model

A column of stacked **module cards**. Each card uses the existing card token (`background: #ffffff; border-radius: 12px; border: 1px solid #d7dadf; padding: 24px;`). Lessons inside are flat rows with `1px solid #f3f5f8` dividers — no nested card-in-card.

### Inline edit affordance

Hover or focus reveals a 12px pencil icon (`color-muted`) at the right of the title. Click swaps to a borderless input that uses the same Inter 14px and shows the focus ring on commit. Enter commits, Escape reverts.

**Recognition over recall** + **aesthetic-usability**: the edit affordance is discoverable but doesn't compete visually with the AI-generated content.

### Skeleton state during generation

Three module-shaped grey blocks (`#f3f5f8` background, `border-radius: 12px`, height-matching the ~120px of a real module card). A subtle horizontal shimmer animation (see Animations below) rather than a spinner — it implies "content arriving" rather than "wait."

### Empty / error / rate-limit states

| State | Visual | Copy |
|---|---|---|
| Brief too short | Inline `aria-describedby` under textarea, red text | "A bit more detail helps — try one or two sentences." |
| Generation failed (500) | Replace skeleton with a card containing the error icon | "We couldn't draft an outline this time. [Try again] or [build it manually]." |
| Live mode unavailable (503) | Banner above brief textarea, amber background | "AI mode is offline — we'll generate from a sample template instead." Auto-falls back to fixture mode. |
| Rate limit (429) | Toast top-right | "Hold on a moment — too many requests. Try again in 30 seconds." |

### Trust signals

- The outline header carries a small `Draft` pill (amber, same token as Option 01's compliance badge).
- Below the brief summary: italic muted text "Generated by AI from your brief — review and edit before publishing."
- Each lesson card has a discreet `AI` badge (`#f3f5f8` bg, `#6c757d` text, 11px) on the right edge. Removed once a user edits the lesson inline.

The user always sees this is a starting point, not a finished course.

## Animations

Three new animations on top of Option 01's three. All `transform` / `opacity` only. All have `prefers-reduced-motion: reduce` fallbacks defined in `prototype/src/styles/animations.css`.

### 1. Module reveal during streaming

```
@keyframes module-reveal {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
```

200ms `ease-out`. Applied to each module card as it arrives. Reduced-motion: opacity-only, 100ms.

### 2. Skeleton shimmer

```
@keyframes shimmer {
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
```

A thin (40% width) light-green-tinted gradient stripe animates left-to-right across the skeleton card every 1.5s, `ease-in-out`. Reduced-motion: animation disabled, static `#f3f5f8` block.

### 3. Accept pulse on inline edit

```
@keyframes edit-accept {
  0%   { background: rgba(23, 223, 135, 0.18); }
  100% { background: transparent; }
}
```

300ms `ease-out`. Fires on the lesson row when the user commits an inline edit. A green wash that fades back to transparent — provides feedback that the edit landed without a toast. Reduced-motion: skipped entirely.

These three plus Option 01's three (stagger reveal, modal scale-in, success pulse) keep the total animation surface area small and reviewable.

## Build phases

Assumes Option 01's scaffold is in place and the AI flow is additive.

| Phase | What | Time estimate |
|-------|------|---------------|
| 1. Migration & types | `002_option_02_ai.sql`, regenerate TS types, fixture JSON file | 25 min |
| 2. Provider abstraction | `ai.ts` interface, `ai.fixtures.ts`, prompt assembler, unit tests for fixture matching | 30 min |
| 3. Live backend (gated) | `ai.live.ts` with Anthropic SDK + prompt caching, env-flag wiring, 503 fallback | 25 min |
| 4. Hono routes | `/api/ai/outline` (SSE), `/api/ai/regenerate`, integration tests in fixture mode | 30 min |
| 5. Brief intake UI | `/products/new/ai` top half, validation, example chips | 25 min |
| 6. Outline editor UI | Module/Lesson cards, inline editing, regenerate/delete, accept-draft flow | 60 min |
| 7. Streaming hook | `useOutlineGeneration` with `EventSource`, error boundaries, abort | 25 min |
| 8. Animations & states | Module reveal, shimmer, edit pulse, error/loading/empty states | 25 min |
| 9. E2E + dev metrics | Playwright spec for full AI flow (fixture mode), update `/dev/metrics` to include AI events | 25 min |
| **Total** | | **~4.5 hours** |

(Compared to Option 01's ~3 hours. The 1.5-hour delta is the AI flow itself.)

## Definition of done for the prototype

- [ ] `npm run dev` starts both frontend and server. Default `AI_MODE=fixture` works with no API key.
- [ ] Setting `AI_MODE=live` + `ANTHROPIC_API_KEY` switches to live SDK calls without code changes.
- [ ] Full flow signup → outline accepted → product page works end-to-end with persistence.
- [ ] All tests pass: `npm run lint && npm run typecheck && npm test && npm run test:e2e`. Tests run in fixture mode and never call the live API.
- [ ] E2E test for the full AI flow exists and measures time-to-completion.
- [ ] Fixture mode generation is deterministic — same brief → same outline.
- [ ] All animations present and respect `prefers-reduced-motion`.
- [ ] Tokens used consistently — no hex literals, no second accent color.
- [ ] One screenshot per route saved to `prototype/public/screenshots/option-02/`.
- [ ] Slide deck section 7 shows the AI flow (deck sync done via `/sync-deck`).
- [ ] `docs/DECISIONS.md` updated with the Option 02 entry plus any deviations.
- [ ] Anthropic SDK code includes prompt caching (verify via `cache_read_input_tokens` in `generations` table).

## Risks & open questions

### Hallucination handling

**Risk:** model invents a Sora 2 feature that doesn't exist, or hallucinates a price-point that doesn't match the market.

**Mitigation:** the system prompt explicitly instructs the model to stay generic on tools and feature names, and to ground prices in three reference brackets (under €99, €99–299, €300+). The user always edits before publishing, and trust signals (Draft pill, AI badge, italic disclaimer) make the provisional nature obvious.

**Residual risk:** acceptable for a hiring prototype. For production this would need a content-policy layer.

### Generation failure

**Risk:** SDK returns 500 / timeout / malformed JSON.

**Mitigation:** the SSE stream emits an `error` event; the UI replaces the skeleton with a recovery card offering retry or "build it manually" — never a dead end. The `generations` table records every attempt, so failures are debuggable post-hoc.

### Demo with or without a real key

**Recommendation: ship with fixture mode as default; gate live mode behind a clearly-named env var.** A hiring reviewer can run the prototype offline. If they want to see live generation, they paste a key into `.env.local` and restart. This keeps the demo robust.

The slide deck shows screenshots from live mode (captured during prep), captioned "live Claude Haiku 4.5 generation, ~1.8s end-to-end."

### Cost & latency

Live Haiku 4.5 with prompt caching: ~$0.001 per outline, ~1.5–2.5s end-to-end. Twenty interview-prep generations cost ~$0.02. **Cost is a non-issue.**

Latency is the bigger story. The streaming UI hides it well — the user sees the first module within 800ms, which is below the Doherty Threshold.

### Reviewer positioning — Option 01 + 02 vs just 02

**Recommendation: present both as a phased roadmap.**

The case-study deck pitches:
- **Slide N:** "Option 01 — what we'd ship next sprint." Conservative, low-risk, solves Blocker 1 directly.
- **Slide N+1:** "Option 02 — what we'd ship next quarter." Ambitious, higher build cost, eliminates the cold-start problem entirely.
- **Slide N+2:** "Why both?" Each option lives in its own route in the prototype. Option 01 is the safety net; Option 02 is the bet. Reviewers see range — quick wins *and* a vision.

Showing only Option 02 risks reading as "all-in on AI" without engineering judgment. Showing both reads as a thoughtful product manager who can sequence ambition.

### Accessibility of streaming content

**Risk:** screen readers may announce every streaming chunk and become noisy.

**Mitigation:** the streaming region uses `aria-live="polite"` with `aria-busy="true"` while generating, set to `false` once `done`. Module titles announce on arrival; lesson rows do not (announced together once the module completes).

### Cross-browser SSE

`EventSource` is supported in all modern browsers including Safari 17+. No polyfill needed for the prototype's target audience. Documented in `docs/DECISIONS.md`.

### Hosted-access banner

If the prototype is ever served from a non-local host (detected by `window.location.hostname !== 'localhost' && hostname !== '127.0.0.1'`), a top banner appears: *"This is a local-only test version of the prototype. For the full demo, please clone the repo and run it offline."* The banner is dismissible per session but reappears on reload. Implementation: a single `<HostedAccessBanner />` component mounted in `App.tsx`, no new dependency.

### "Coming in full version" affordances inventory

Three deliberate previews of future behavior, each with the same visual treatment (`Soon` pill, muted icon, tooltip on hover/focus):

| Affordance | Where | Tooltip / panel copy |
|---|---|---|
| Voice dictation | Top-right of brief textarea | "Voice dictation — connects to a Chinese open-source model in the full version." |
| Multi-turn chat refinement | Bottom-right of outline editor | "Multi-turn refinement is coming in the full version. For now, use the regenerate button or edit inline." |
| Lesson body editing | Right rail of `/products/:id/content` | "Edit lesson body — coming in the full version." |

These signal range-of-vision to the reviewer without inflating build cost.

## Trade-off summary vs Option 01

| Dimension | Option 01 | Option 02 |
|---|---|---|
| **Ambition** | Conservative, targeted | Ambitious, structural |
| **Build cost** | ~3 hours | ~4.5 hours |
| **Demo risk** | Very low (no external dependencies) | Low (fixture mode is offline + deterministic) |
| **Hiring-signal value** | Shows engineering judgment + design-system fluency | Adds AI fluency, prompt caching, streaming UX, abstraction design |
| **Persona fit for Alex** | Solves friction; still requires Alex to write course | Solves friction *and* gives Alex a starting point in seconds |
| **Production readiness** | Could ship next sprint | Needs content-policy layer + real localization |

**Decision: present both as a phased roadmap.** Frame it as: *"Option 01 ships as a hotfix next sprint to stop the bleeding on signup friction. Option 02 ships next quarter as the structural fix — the AI flow that eliminates the cold-start problem entirely."* The deck closes with a single slide showing both flows side-by-side and the same `time-to-value` metric (4.5 minutes vs 2.4 minutes), making the trade-off legible at a glance.

## Fixture brief library

The fixture library is the *only* AI surface the reviewer sees by default (live mode is opt-in). Coverage matters: each brief in the library is essentially a **demo scenario**, and a thoughtful reviewer will try at least 3–4. Below is the candidate menu with rationale, organised by axis. The recommended ship-set is at the end.

### Why each brief earns its slot

A good fixture brief satisfies four criteria:

1. **Plausible for Alex.** Sits inside the persona's content gravity (AI, creator tooling, audience growth, monetisation).
2. **Distinct outline shape.** Produces a *visibly different* module/lesson structure from neighbours so the reviewer sees the system isn't a Mad Libs template.
3. **Showcase-grade dummy body.** Topic supports a body that reads as substantive (not generic filler).
4. **Resilient to misuse.** If the reviewer mistypes or improvises, a fuzzy match still routes them to a thematically adjacent fixture rather than the generic fallback.

### Candidate library (axis-organised)

**Axis A — Generative AI tooling (Alex's home turf).**
- A1. *Sora 2 for branded content* — short-form video, brand-safe prompting, editing pipeline.
- A2. *Veo 3 cinematic shorts* — narrative video, shot composition, prompt-as-storyboard.
- A3. *Midjourney for product launches* — visual identity, mood boards, marketing assets.
- A4. *ChatGPT custom GPTs as a side hustle* — building, packaging, monetising small AI products.
- A5. *Claude artifacts for non-engineers* — using Claude to build small interactive tools without code.
- A6. *Prompt engineering 101* — fundamentals, evaluation, prompt patterns, common failure modes.

**Axis B — Creator craft (the production side of being an influencer).**
- B1. *Video editing for creators* — pacing, hook craft, retention curves, CapCut/Resolve fundamentals.
- B2. *YouTube Shorts to long-form pipeline* — repurposing, narrative arc translation, retention strategy.
- B3. *Podcasting for solo creators* — equipment, recording, post-production, distribution.
- B4. *Newsletter writing that pays* — voice, structure, retention, monetisation.

**Axis C — Audience growth & monetisation (the business side).**
- C1. *Building an audience on Threads* — platform-native voice, algorithm signals, community.
- C2. *Building an audience on TikTok in 2026* — sound-driven hooks, niching, posting cadence.
- C3. *AI for solopreneurs* — using AI tools to operate as a one-person business across ops, sales, content.
- C4. *Selling digital products without ads* — organic funnels, lead magnets, lifecycle email.
- C5. *Cold-email outreach for freelancers* — list building, copy, deliverability, pipeline metrics.

**Axis D — Adjacent professional skills (broadens the demo without leaving the persona).**
- D1. *No-code product building with Claude + Supabase* — shipping a real app as a non-engineer.
- D2. *Notion as a second brain for creators* — capture systems, weekly reviews, content pipelines.
- D3. *Public speaking for online creators* — keynote craft, stage presence, talk monetisation.
- D4. *Personal branding on LinkedIn* — positioning, post types, lead generation.

### Recommended ship-set (6 fixtures)

**Goal:** maximise visible variety across the four axes while keeping the JSON file under ~120 KB and authoring effort under ~70 minutes.

| # | Brief | Axis | Why this one |
|---|---|---|---|
| 1 | **Claude artifacts for non-engineers** | A — AI tooling | Showcases "AI for AI work" — meta-relevant given this case study itself uses Claude. Strong anchor fixture for the persona. |
| 2 | **Prompt engineering 101** | A — AI tooling | Theory-heavy outline shape with fewer hands-on modules. Demonstrates the system isn't biased toward how-to. |
| 3 | **Newsletter writing that pays** | B — Creator craft | Writing-craft outline. Tests that the system can produce a non-tutorial structure. |
| 4 | **Building an audience on Threads** | C — Growth | Strategy-heavy, tactic-list shaped. Recent platform; signals the system is current. |
| 5 | **AI for solopreneurs** | C — Growth | Crosses tooling × business; broad scope tests how the system handles ambitious briefs. |
| 6 | **No-code product building with Claude + Supabase** | D — Adjacent | Ship-something-real outline; demonstrates the AI handles project-shaped courses (milestones, not weekly modules). Pairs naturally with #1 — both lean on Claude. |

The fallback "generic creator economy" template stays in place for any brief that doesn't fuzzy-match (Levenshtein distance + topic-keyword overlap on the first 32 chars).

### Authoring approach for the fixtures

Each fixture is hand-authored to a fixed shape: **4–6 modules, 3–5 lessons per module, lesson body 3–6 paragraphs (~250–400 words each)**. Authoring is done *once* using live Claude Haiku 4.5 calls in dev (the same prompts the live backend uses), then the outputs are reviewed, lightly edited for voice consistency, and committed as JSON. This means:

- Fixture quality matches live quality (because they came from live).
- No drift between fixture and live behaviour over time (we re-run the authoring script if prompts change).
- Tests stay deterministic because the *outputs* are checked in, not regenerated.

A small `scripts/regenerate-fixtures.ts` is committed alongside, gated behind `--live` and an explicit env confirmation, so future contributors can refresh fixtures intentionally.

## Open questions to validate during build

1. **Fixture ship-set.** Locked at 6 briefs (Claude artifacts, prompt eng. 101, newsletter writing, Threads growth, AI for solopreneurs, no-code with Claude + Supabase). Sora 2 and video editing dropped per user direction.
2. **Should the AI also draft a price?** **Recommendation:** yes, but rounded to €49/€99/€149/€199/€299 brackets so it never feels arbitrary. Stored on `course_briefs.suggested_price_cents` and prefilled (not enforced) on the product.
3. **Per-lesson regeneration?** Currently only modules can be regenerated. **Recommendation:** defer per-lesson regeneration unless a reviewer asks for it. Inline editing covers most cases and keeps the UI simple (Hick's Law).
4. **Should the brief inform the user's `business_type` ambient-onboarding signal?** **Recommendation:** yes for `inferred_topic` and `inferred_audience` (stored on `users` quietly), but defer `business_type` since the brief doesn't reliably convey it.
5. **Voice-dictation icon — placement.** Inside the textarea (top-right) or anchored beside it? **Recommendation:** inside the textarea, top-right, so it reads as part of the input affordance and doesn't compete with the primary CTA.
6. **Chat-refine entry point.** Floating bubble (recommended) or inline button next to "Looks good"? Bubble keeps the primary action uncluttered and signals "always available."
