# CLAUDE.md — Master Instructions

> Every Claude Code instance working in this repo reads this file on session start.
> This is the source of truth for what to do, how to do it, and where things live.

## What this project is

The ablefy Product Builder case study. Two-part hiring exercise:

1. **Audit** of ablefy's onboarding (DONE — see Notion: `https://www.notion.so/356392a25611813cbfdbd142e5d44032`)
2. **Redesign + working prototype** (Option 01: targeted fix of the current onboarding flow)

The persona is **Alex** — 28, AI influencer, 10K followers, 10–15 min evaluation window. Every decision is measured against: *does this move Alex closer to creating, or ablefy closer to collecting?*

## Hard rules (never violate)

1. **MIT standards everywhere.** TypeScript strict mode. ESLint clean. Prettier formatted. Vitest for unit, Playwright for e2e. Every file has the MIT header (see `scripts/add-license-header.sh`).
2. **Match the ablefy design system exactly.** Tokens live in `prototype/src/styles/tokens.css`. Read `docs/DESIGN-SYSTEM.md` before touching styling. **Never** introduce a second accent color or non-Inter font.
3. **Cross-browser animations only.** No `@scroll-timeline`, no experimental CSS. Stick to `transform`, `opacity`, `transition`, and `@keyframes`. Always include `@media (prefers-reduced-motion: reduce)` fallbacks. See `prototype/src/lib/motion.ts`.
4. **Don't break the contract.** The redesigned flow has a fixed shape (see `docs/FLOW.md`). Steps may be improved internally, but the step boundaries and success criteria are locked.
5. **Respect the scope.** Option 01 covers **signup → course created** only. Community (foroom) and content building are out of scope.

## How to work in this repo

- **Plan before code.** For any task larger than a single file, write the plan to `docs/DECISIONS.md` first. Date-stamped, with rationale.
- **Small commits, conventional messages.** `feat(prototype): …`, `fix(server): …`, `docs(plan): …`. One concern per commit.
- **Tests live next to code.** `Foo.tsx` → `Foo.test.tsx`. No giant `__tests__` dirs.
- **No dependencies without justification.** If you add to `package.json`, note why in `docs/DECISIONS.md`.
- **Use `REFERENCE.md` first.** Before exploring with `find`/`grep`/`ls`, read [`REFERENCE.md`](./REFERENCE.md) — it indexes every file in the repo with a one-line description. This saves context.

## Coding Guidelines

### 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: *"Would a senior engineer say this is overcomplicated?"* If yes, simplify.

### 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that **your** changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria enable independent looping. Weak criteria ("make it work") require constant clarification.

## Multi-instance workflow

Multiple Claude Code sessions can work in parallel using git worktrees:

```bash
# From the repo root
git worktree add ../ablefy-case-study-prototype -b feature/prototype
git worktree add ../ablefy-case-study-presentation -b feature/presentation
git worktree add ../ablefy-case-study-tests -b feature/tests
```

Each worktree gets the same `.claude/` config (hooks, agents, skills) so behavior is identical across instances. Coordinate through `docs/DECISIONS.md` and the queue in `.claude/.queue.json` (created on demand).

## Automations active in this repo

| When | What runs | Why |
|------|-----------|-----|
| `Write`/`Edit` in `prototype/src/**` | `code-reviewer` subagent | Catches MIT/style/a11y issues before they land |
| `code-reviewer` reports issues | `bug-fixer` subagent | Auto-applies safe fixes |
| `Write`/`Edit` in `prototype/**` (any) | `npm test -- --run --silent` (PostToolUse hook) | Fast feedback on regressions |
| Structural changes in `prototype/src/routes/**` | `presentation-updater` subagent | Keeps slides in sync with prototype |
| Session start | `.claude/hooks/session-start.sh` | Loads branch, recent decisions, open TODOs into context |
| Bash command containing `rm -rf`, `DROP TABLE`, etc. | PreToolUse blocker | Safety gate |

Inspect with `/hooks` inside Claude Code or read `.claude/settings.json` directly.

## Where things live

| Path | What |
|------|------|
| `docs/PLAN.md` | The full plan for the prototype |
| `docs/FLOW.md` | The redesigned user flow (signup → course created) |
| `docs/DESIGN-SYSTEM.md` | Tokens, components, voice (from authenticated screenshots) |
| `docs/DECISIONS.md` | Append-only decision log |
| `prototype/src/` | React app (Vite + TypeScript + Tailwind) |
| `prototype/server/` | API + SQLite (Hono + better-sqlite3) |
| `prototype/server/db/schema.sql` | Database schema |
| `presentation/slides.md` | Marp slide deck |
| `.claude/agents/` | Subagent definitions |
| `.claude/skills/` | Skills (design system, Laws of UX, React MIT standards) |
| `.claude/hooks/` | Shell scripts triggered by hooks |
| `.claude/commands/` | Custom slash commands |
| `.claude/settings.json` | Project-wide Claude Code config (committed) |
| `.claude/settings.local.json` | Personal overrides (gitignored) |

## Definition of Done

A task is done when:
- [ ] Code passes `npm run lint && npm run typecheck && npm test`
- [ ] New behavior has a test
- [ ] If user-facing: screenshot in `docs/screenshots/` and the slide deck reflects it
- [ ] If a decision was made: appended to `docs/DECISIONS.md` with rationale
- [ ] Commit message follows Conventional Commits
