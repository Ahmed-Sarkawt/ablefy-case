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

## Key docs

- [Decision log](../../tree/data/docs/DECISIONS.md)
- [User flow spec](../../tree/data/docs/FLOW.md)
- [Design system](../../tree/data/docs/DESIGN-SYSTEM.md)
- [Prototype README](../../tree/prototype/README.md)

---

*MIT License · Ahmed Sulaiman · 2026*
