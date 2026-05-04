# presentation branch

Marp slide deck for the ablefy onboarding redesign case study.  
Auto-builds to GitHub Pages on every push to this branch.

---

## View

**Live:** `https://<org>.github.io/ablefy-case-study/` *(once GitHub Pages is configured)*

**Local:**

```bash
# Install Marp CLI
npm install -g @marp-team/marp-cli

# Preview in browser (live reload)
marp --preview slides.md

# Export to HTML
marp slides.md --output dist/index.html

# Export to PDF
marp slides.md --output slides.pdf --pdf
```

---

## Structure

```
presentation/
├── slides.md        The deck — single Markdown file, all slides
└── README.md        This file
```

The deck is kept in sync with the prototype by the `presentation-updater` subagent, which runs automatically when routes change in the prototype.  
Manual sync: run `/sync-deck` in Claude Code.

---

## GitHub Pages deploy (planned)

When created, the workflow will:

1. Trigger on push to `presentation` branch
2. Install Marp CLI
3. Build `slides.md` → `dist/index.html`
4. Deploy `dist/` to GitHub Pages via `peaceiris/actions-gh-pages`

Workflow will live at `.github/workflows/presentation-deploy.yml`.

---

*Slide content mirrors the prototype at `prototype` branch.*  
*Source research: `data` branch → `docs/`*
