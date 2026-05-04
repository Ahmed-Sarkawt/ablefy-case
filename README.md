# ablefy — Product Builder Case Study

A hiring exercise for the ablefy product team: audit the onboarding experience and redesign it as a working prototype.

This repo is split across **four focused branches**. Each branch is self-contained — they are not merged into each other.

---

## Branch map

| Branch | Contents | Status |
|--------|----------|--------|
| **`main`** | You are here — project meta, Claude setup, guidelines | Stable |
| **`data`** | Research, flows, design system, decisions, reference screenshots | Stable |
| **`prototype`** | Working React + Hono app (`/signup → /dashboard → publish`) | Active |
| **`presentation`** | Marp slide deck, auto-deploys to GitHub Pages on push | Planned |

---

## What's in `main`

```
├── CLAUDE.md            Master instructions for every Claude Code session
├── REFERENCE.md         Index of every tracked file across branches
├── .github/
│   └── workflows/       CI for prototype · Pages deploy for presentation
├── .claude/
│   ├── settings.json    Hooks, permissions, agent config
│   ├── agents/          Subagent definitions (code-reviewer, bug-fixer, …)
│   ├── hooks/           Shell scripts fired by Claude events
│   ├── skills/          Project-specific skill packs (design system, UX laws, …)
│   └── commands/        Custom slash commands (/review, /sync-deck, /test-flow)
├── scripts/             Utility scripts (setup, worktree, license header)
└── LICENSE
```

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 · TypeScript strict · Vite · Tailwind CSS |
| Backend | Hono · better-sqlite3 · bcrypt |
| Tests | Vitest (unit) · Playwright (e2e) |
| Slides | Marp (Markdown → HTML · PDF · GitHub Pages) |
| AI tooling | Claude Code · Claude Sonnet 4.6 |

---

## What's automated

| Trigger | What runs |
|---------|-----------|
| `Write`/`Edit` in `prototype/src/**` | `code-reviewer` subagent → `bug-fixer` for safe fixes |
| Any save in `prototype/**` | `npm test --silent` (fast regression check) |
| Route change in `prototype/src/routes/**` | `presentation-updater` syncs the slide deck |
| Push to `prototype` branch | GitHub Actions: typecheck + lint + unit tests |
| Push to `presentation` branch | GitHub Actions: Marp build → GitHub Pages *(planned)* |

Full hook config: [`.claude/settings.json`](./.claude/settings.json)

---

## Key references across branches

- **Decision log** → [`data` branch: `docs/DECISIONS.md`](../../tree/data/docs/DECISIONS.md)
- **User flow spec** → [`data` branch: `docs/FLOW.md`](../../tree/data/docs/FLOW.md)
- **Design system** → [`data` branch: `docs/DESIGN-SYSTEM.md`](../../tree/data/docs/DESIGN-SYSTEM.md)
- **Prototype quick start** → [`prototype` branch: `README.md`](../../tree/prototype/README.md)
- **Live slides** → [`presentation` branch: GitHub Pages](../../tree/presentation)

---

## Persona

**Alex** — 28-year-old AI influencer, 10K followers, 10–15 min evaluation window.  
Every design decision is measured against: *does this move Alex closer to creating, or ablefy closer to collecting?*

---

*MIT License · Ahmed Sarkawt · 2026*
