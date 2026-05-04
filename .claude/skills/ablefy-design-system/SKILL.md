---
name: ablefy-design-system
description: Use whenever you write CSS, JSX/TSX styling, or Tailwind classes for the prototype. Defines the exact tokens, components, and motion patterns observed in ablefy's authenticated cabinet UI. The full spec is in docs/DESIGN-SYSTEM.md — this skill summarizes the rules you must enforce.
---

# ablefy Design System (enforcement rules)

Read `docs/DESIGN-SYSTEM.md` for the full spec. This file is the short list of rules every line of styling must follow.

## Hard rules

1. **One accent color.** `#17df87` for all interactive states, focus rings, primary CTAs. Never introduce a second accent.
2. **One typeface.** Inter. Weights 400, 500, 600, 700 only.
3. **8px grid.** All spacing must be a multiple of 4px, and you should prefer 8/12/16/20/24/32/40/48.
4. **Radius scale.** `4px` (sm), `8px` (md), `12–15px` (lg), `9999px` (full). Nothing in between.
5. **Sidebar `#21282e`.** Always. The dark anchor of every page.
6. **AA contrast.** Green on white **fails** for body text — use `#05ab5b` for green text on light backgrounds.
7. **Flat-first.** Heavy shadows are forbidden. Use the elevation scale in tokens.css.

## Always reference tokens

```tsx
// ❌ Wrong
<div style={{ background: '#17df87', padding: 14 }}>

// ✅ Right
<div className="bg-primary p-4">          // Tailwind, configured to map to tokens
// or
<div style={{ background: 'var(--color-primary)', padding: 'var(--space-16)' }}>
```

The tokens live in `prototype/src/styles/tokens.css`. Tailwind is configured to expose them as utility classes.

## Motion rules

- Only `transform` and `opacity` for transitions (GPU-friendly)
- Durations: 150ms (button hover) · 200ms (modal/dropdown) · 300ms (chart/page) · max 500ms (data render)
- Easing: `ease-out` for enter, `ease` for default, `ease-in-out` for back-and-forth
- Always include `@media (prefers-reduced-motion: reduce)` to disable

## Voice

CTAs are action verbs: "Create", "Add", "Save & close", "Build your community". Never "Click here", never "Submit". Match ablefy's existing copy register.
