# Decision Log

Append-only. Newest first. Each entry: date, decision, rationale, alternatives considered.

---

## 2026-05-04 — Advanced settings expansion in ProductsNew (from design references)

**Decision:** Expanded the "Advanced settings" Disclosure in `/products/new` to include five new sub-sections, sourced directly from the authenticated ablefy cabinet screenshots in `Design References/`:

1. **Product type** — `<select>` with three options matching the reference: *Digital*, *Online Course*, *Online Course (pre-recorded)*. Defaults to *Online Course*. Helps the platform route delivery logic correctly.
2. **Access & Duration** — Lifetime access toggle (checkbox, on by default). When unchecked, a "Duration (months)" number field appears so creators can set time-limited access. Matches the *Access & Duration* section in the Cabinet Products screenshot.
3. **When unavailable** — Three-option radio group: *Redirect to shop page* (default) / *Show sold-out state* / *Redirect to another product*. Matches the *Redirect if product is unavailable* section in the screenshot.
4. **Position** — Optional number field. Controls order in the shop; blank means auto-sorted. Matches the *More options → Position* field in the reference.
5. **Overall limit** — Optional toggle + number field. When enabled, sets a cap on total purchases. Matches *More options → Overall limit* in the reference.

The existing fields (payment model, currency) remain as the top two sections within Advanced settings.

**UI/UX rationale (Laws of UX applied):**
- *Hick's Law* — all five sections remain collapsed behind the "Advanced settings" Disclosure. The main form surface (name, description, image, price) is unchanged; creators who don't need these options never see them.
- *Progressive disclosure* — the duration months field is conditionally rendered only when lifetime access is unchecked, reducing visual noise (Miller's Law: 7±2 items).
- *Jakob's Law* — the product-type dropdown and access-duration pattern match Kajabi/Teachable conventions, so ablefy sellers with prior experience feel at home.
- *Aesthetic-Usability Effect* — sections are visually separated with a `divider` line + section label (uppercase, tracking-wider), matching the reference screenshot's grouping.

**Schema changes:** Six new columns added to the `products` table in `schema.sql`: `product_type`, `lifetime_access`, `duration_months`, `unavailable_redirect`, `position`, `overall_limit`. All nullable or with safe defaults; backwards-compatible with existing draft rows. Dev DB must be recreated (`rm prototype/server/db/dev.db`).

**Server changes:** `products.ts` Zod schema extended with the six new optional fields. INSERT expanded accordingly.

**What was deliberately excluded from the design reference:**
- *Internal product name* — The reference shows a separate "internal name" distinct from the public title. Excluded because our form's single "Product name" field already serves that purpose in a prototype context; splitting it adds complexity without flow-redesign value.
- *Custom product URL slug* — Excluded; requires server-side slug uniqueness enforcement and slug-to-ID routing beyond the prototype scope.
- *Pay later message (PayPal/Klarna)* — Excluded; requires payment-gateway configuration data outside scope.
- *"Always stock visible" (Pro feature)* — Excluded; requires plan-gating logic not present in the prototype.

**Alternatives considered:**
- *Flat-expand everything at once* — Rejected. Violates Hick's Law; the reference itself uses progressive disclosure for these fields.
- *Separate route `/products/new/advanced`* — Rejected. The FLOW.md step boundary is locked at a single `/products/new` page.
- *Add to a separate Settings tab post-creation* — Considered. Rejected because the reference explicitly places these fields in the product editor, not a settings page. Creators expect to configure access duration at creation time.

---

## 2026-05-04 — Option 02 plan refined (dummy bodies, voice icon, chat preview, hosted banner, roadmap framing)

**Decision:** Five updates to `docs/PLAN-OPTION-02.md` based on user direction:

1. **Dummy lesson bodies are in scope.** AI generates 3–6 paragraphs of plausible markdown per lesson alongside the outline. Read-only in the prototype with a "Coming in full version — edit lesson body" affordance. New `/products/:id/content` route renders the body so the reviewer walks the entire flow, not just the outline.
2. **Voice-dictation icon is visible (functionality is not).** Microphone icon top-right inside the brief textarea, with hover/focus tooltip *"Voice dictation — connects to a Chinese open-source model in the full version."* Click is a no-op that surfaces the tooltip as a toast.
3. **Multi-turn chat is previewed, not built.** Floating "Refine with chat" bubble in the outline editor opens a side panel with a single assistant message saying multi-turn refinement is coming in the full version, plus a disabled input. Sets future direction without build cost.
4. **Hosted-access banner.** If `hostname !== localhost/127.0.0.1`, top banner reads *"This is a local-only test version of the prototype — please clone and run it offline for the full demo."* Dismissible per session.
5. **Deck framing.** Both options are pitched as a phased roadmap: Option 01 ships as a hotfix next sprint; Option 02 ships next quarter as the structural fix.

Confirmed unchanged: Claude Haiku 4.5 with prompt caching, fixture mode default, German fields mocked as `{title} (DE)`.

**Fixture library locked at 6 briefs** across 3 axes (AI tooling × 2, creator craft × 1, growth × 2, adjacent × 1):

1. Claude artifacts for non-engineers
2. Prompt engineering 101
3. Newsletter writing that pays
4. Building an audience on Threads
5. AI for solopreneurs
6. No-code product building with Claude + Supabase

Sora 2 and video editing dropped per user direction. The Lovable-based no-code brief was reframed as Claude + Supabase to pair thematically with #1.

**Rationale:** the user wants the prototype to *feel* like a complete solution end-to-end so reviewers see the full vision, not a sliver of it. Previewing future affordances (voice, chat, lesson editing) costs minutes per affordance and signals product range. Dummy bodies cost ~600 tokens per lesson at authoring time and zero at runtime (fixtures are pre-baked).

**Alternatives considered:**

- **Build voice and chat for real.** Rejected — voice would require integrating a third-party model (Whisper-class) and adds permission/UX complexity outside the case-study scope; chat would require conversation-state design that isn't load-bearing for the central thesis.
- **Skip dummy bodies, keep outline-only.** Rejected — leaves the post-creation step feeling like a dead end and undersells the AI flow's potential.
- **Smaller fixture set (3–5 briefs).** Considered as an alternative to keep authoring effort low. Re-evaluate after user sign-off on the 8-fixture recommendation.

---

## 2026-05-04 — Plan Option 02 (AI Course Creator) committed

**Decision:** Add Option 02 as an alternative course-creation path that uses an LLM to draft a course outline from a 1–3 sentence brief. Plan lives in `docs/PLAN-OPTION-02.md`. Coexists with Option 01 — same database, same dashboard, same auth. Differs only on the path between dashboard and `products/:id/created`.

**Rationale:** Option 01 explicitly punts on Blocker 2 (cold-start course building). Option 02 fuses Blocker 1 + Blocker 2 by replacing the manual product form with an AI brief-to-outline flow that doubles as ambient onboarding (audience and topic are inferred from the brief, never asked). Demo target time-to-first-draft-course drops from Option 01's 5 minutes to under 3 minutes. Presented as the second half of a phased roadmap: Option 01 = next sprint, Option 02 = next quarter.

**Key architectural choices:**

- **Provider:** Anthropic SDK, Claude **Haiku 4.5** as default model. Faster, cheaper, sufficient for structured outline generation. Sonnet 4.6 swappable via `AI_MODEL` env var.
- **Default mode:** **Fixture (deterministic)**. The prototype runs offline with no API key. Live mode is opt-in via `AI_MODE=live` + `ANTHROPIC_API_KEY`. Tests only ever run in fixture mode.
- **Prompt caching:** mandatory (per the `claude-api` skill). System prompt + outline schema are cached as one ephemeral block; only the user brief is fresh on each call. Cache hits are persisted in the `generations` audit table (`cached=1`).
- **Streaming:** Server-Sent Events via Hono's `streamSSE` helper. No new dependencies. `EventSource` on the client; `aria-live="polite"` for accessibility.
- **Data:** new `course_briefs` and `generations` tables; additive columns on `lessons` and `users`. Migration `002_option_02_ai.sql`. The `products` row shape is unchanged so Option 01 and Option 02 produce interchangeable drafts.
- **UI scope:** outline editor only. The lesson-content editor stays out of scope (matches Option 01).

**Alternatives considered:**

- **Sonnet 4.6 default.** Rejected — 5× cost, 2–3× latency, marginal quality gain on this task.
- **OpenAI / multi-provider.** Rejected — the project skill enforces Anthropic SDK + caching; multi-provider abstraction is over-engineering for a hiring prototype.
- **Live mode default with a checked-in key.** Rejected — security risk, and the demo must run offline for a reviewer with no key.
- **Chat-style multi-turn refinement UI.** Rejected — adds conversation state without measurable benefit. Inline edit + per-module regenerate covers the same surface with less complexity (Hick's Law).
- **Per-lesson regeneration.** Deferred — module-level regeneration plus inline editing is sufficient. Re-evaluate if a reviewer asks.
- **Replace Option 01 entirely with Option 02.** Rejected — losing the conservative option weakens the deck. Both flows ship; deck pitches them as a roadmap.

---

## 2026-05-04 — Use Hono + better-sqlite3 for the server

**Decision:** Hono framework, better-sqlite3 driver, single SQLite file at `prototype/server/db/dev.db`.

**Rationale:** Hono is tiny, TypeScript-first, runs in Node and Bun, and its routing is closer to web standards than Express. better-sqlite3 is synchronous which simplifies the server code dramatically for a prototype (no `await` pollution on every query). For a hiring case study, simpler is better.

**Alternatives considered:** Express + Prisma (heavier, slower DX), Fastify (good but more boilerplate), Drizzle ORM (overkill at this scale).

---

## 2026-05-04 — Vite + React 18, not Next.js

**Decision:** Pure Vite + React Router (data router) for the frontend.

**Rationale:** No SSR or SEO requirements. Vite is faster to set up and faster to run. Next.js would add complexity without benefit for a prototype that's just demonstrating the redesigned flow.

**Alternatives considered:** Next.js, Remix. Both rejected as over-engineered for the scope.

---

## 2026-05-04 — Tailwind, with tokens exposed as CSS variables

**Decision:** Tailwind for styling, but with `tailwind.config.ts` reading from `tokens.css` (single source of truth).

**Rationale:** Tailwind gives speed; CSS variables give portability and let the code-reviewer enforce "no hex literals." If we later swap Tailwind for vanilla CSS or another library, the tokens stay.

**Alternatives considered:** CSS Modules (more verbose), styled-components (runtime cost, harder to enforce design system).

---

## 2026-05-04 — Single accent color enforcement via lint rule

**Decision:** Add an ESLint rule that flags any hex literal except `#fff`, `#000`, and the tokens defined in `tokens.css`.

**Rationale:** The audit identified design-system drift. Make drift impossible at lint time, not just review time.

**Alternatives considered:** Trust the code-reviewer agent to catch it. Rejected — defense in depth is cheap.

---

## 2026-05-04 — Instrument `onboarding_events` in the prototype

**Decision:** Yes. Every flow step writes a row to `onboarding_events`. A hidden `/dev/metrics` route reads it and shows time-to-value (`product_created` − `signup_completed`).

**Rationale:** Trivial to implement (one helper + one insert per step) and gives us a real number to put on the slide deck. Without it, the "under 5 minutes" claim is hand-waved.

**Alternatives considered:** Skip instrumentation, demo with stopwatch. Rejected — measurable beats anecdotal in a hiring case study.

---

## 2026-05-04 — Cover image is a URL field, not a real upload

**Decision:** Single text input for image URL with a "Use a sample image" helper that pre-fills a known-good Unsplash link.

**Rationale:** Real upload requires storage + presigned URLs + a worker. Out of proportion for a prototype demonstrating flow ergonomics. The UX of pasting a URL is identical to upload from the user's perspective once it renders.

**Alternatives considered:** Local file upload to `prototype/public/uploads/`. Rejected — adds Multer/Busboy + filesystem writes for zero flow-redesign value.

---

## 2026-05-04 — bcrypt for password hashing (not mock)

**Decision:** Use `bcrypt` (cost factor 10) for password hashing in the auth endpoints.

**Rationale:** 5 minutes of work, looks correct in a code review, and lets the e2e test exercise a real signup → login round-trip. Mocking saves nothing meaningful.

**Alternatives considered:** Plaintext passwords with a `// MOCK` comment. Rejected — sets a bad precedent and the code-reviewer agent will flag it anyway.

---

## (template for new entries)

## YYYY-MM-DD — <decision>

**Decision:**

**Rationale:**

**Alternatives considered:**
