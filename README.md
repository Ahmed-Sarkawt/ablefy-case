# ablefy — Product Builder Case Study

Hiring exercise for the ablefy product team: audit the onboarding experience, then redesign it as a working prototype.

The persona is **Alex** — 28, AI influencer, 10K followers, 10–15 min evaluation window. Every decision is measured against: *does this move Alex closer to creating, or ablefy closer to collecting?*

## Branches

| Branch | What's in it |
|--------|-------------|
| `main` | Project meta, Claude config, guidelines |
| `data` | Research, flows, design system, decision log |
| `prototype` | Working React + Hono app (signup → dashboard → publish) |
| `presentation` | Marp slide deck → GitHub Pages |

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 · TypeScript · Vite · Tailwind CSS |
| Backend | Hono · better-sqlite3 · bcrypt |
| Tests | Vitest (unit) · Playwright (e2e) |
| Slides | Marp (Markdown → HTML / PDF) |
| AI tooling | Claude Code · Claude Sonnet 4.6 |

## Sub-agents

Four Claude Code sub-agents run automatically during development:

| Agent | Trigger | What it does |
|-------|---------|-------------|
| `code-reviewer` | Any write/edit in `src/` or `server/` | Reviews for MIT violations, a11y issues, design-system drift, and safety concerns. Tags findings by severity and marks which are auto-fixable. |
| `bug-fixer` | After a `code-reviewer` report | Applies only findings tagged "Auto-fixable: yes". Never invents fixes — works strictly from the reviewer's queue. |
| `test-writer` | New component added without tests | Generates Vitest unit and Playwright e2e tests. Writes failing tests first, then explains what they check. |
| `presentation-updater` | Route added or flow step changed | Keeps `presentation/slides.md` in sync with the prototype — updates route list, flow steps, and screenshots. |

Agent definitions live in [`.claude/agents/`](./.claude/agents/).

## Key docs

- [Decision log](../../tree/data/docs/DECISIONS.md)
- [User flow spec](../../tree/data/docs/FLOW.md)
- [Design system](../../tree/data/docs/DESIGN-SYSTEM.md)
- [Prototype README](../../tree/prototype/README.md)

---

*MIT License · Ahmed Sulaiman · 2026*
