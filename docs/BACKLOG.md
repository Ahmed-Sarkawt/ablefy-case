# Code Review Backlog

Issues audited on 2026-05-06. Critical and high severity are already fixed. These are medium and low items to address next.

---

## Medium

### M1 — `ProductDetail.tsx:537` — `selected` prop on `<option>` ignored by React
React controls `<select>` via `value` on the element, not `selected` on individual `<option>`s. The product type selector always appears unselected.
**Fix:** Add `value={product.product_type}` to the `<select>` and remove all `selected` props from the `<option>` elements.

### M2 — `ProductDetail.tsx:172` — Broken ARIA tab pattern
Buttons have `role="tab"` and `aria-selected` but there is no `role="tablist"` on the container and no `role="tabpanel"` on the content. Screen readers can't navigate the tab structure.
**Fix:** Add `role="tablist"` to the `<nav>`. Wrap each panel in `<div role="tabpanel" id="panel-{id}" aria-labelledby="tab-{id}">`. Add matching `id="tab-{id}"` to each tab button.

### M3 — `ProductsList.tsx:215` — `onClick` on `<tr>` is keyboard-inaccessible
`<tr>` is a layout element. Keyboard users can't tab to it or activate it with Enter.
**Fix:** Remove `onClick` from `<tr>`. The nested `<button>` already handles the click path.

### M4 — `CabinetShell.tsx:429` — Settings modal invisible to assistive technology
The backdrop uses `role="presentation"`, making the modal invisible to screen readers. No `aria-modal`, no `aria-labelledby`, no focus trap.
**Fix:** Change to `role="dialog"`, add `aria-modal="true"` and `aria-labelledby` pointing to the modal heading. Implement a focus trap (or switch to `<dialog>` element as used in `PaymentModal`).

### M5 — `Button.tsx:26` — Hex color literals violate the design token rule
`disabled:bg-[#eceef2]` and `disabled:text-[#4a4a4a]` are hard-coded. These should be `disabled:bg-bg-canvas` and `disabled:text-soft`.

### M6 — `PaymentModal.tsx:438` — Duplicate `id="pm-interval"` across three rendered instances
`IntervalSelect` is rendered three times, all sharing the same `id`. Replace with a `useId()`-generated id inside `IntervalSelect`.

### M7 — `tests/e2e/flow.spec.ts:22,30` — E2E tests use wrong selectors
- Line 22: `getByRole('heading', { name: /sign up/i })` — actual heading is "Create seller account".
- Lines 30, 66: `getByRole('link', ...)` — the elements are `<button>`, not `<a>`.
Both selectors never match, making these test steps non-functional.

### M8 — `server/routes/products.ts:184` — `userId` query param not validated as UUID
The value is passed into a parameterised query (no injection risk) but any string is accepted. Inconsistent with the Zod validation used everywhere else.
**Fix:** Add `z.string().uuid().safeParse(userId)` guard; return 400 on failure.

### M9 — `Dashboard.tsx:452`, `CabinetShell.tsx:431` — `color-mix()` without CSS fallback
`color-mix(in srgb, ...)` has no fallback for older browsers, violating the "no experimental CSS" rule in CLAUDE.md.
**Fix:** Add a `rgba(250,250,252,0.55)` fallback before the `color-mix` value.

---

## Low

### L1 — `package.json` — Unused dependencies `lucide-react` and `zustand`
Neither package is imported anywhere. They add bundle weight with no benefit.
**Fix:** Remove both from `dependencies`.

### L2 — `server/db/migrate.ts:12` — Hard-coded `dev.db` path ignores `DB_PATH` env var
Running `npm run db:reset` with a custom `DB_PATH` migrates the wrong file.
**Fix:** `const dbPath = process.env.DB_PATH ?? join(here, 'dev.db');`

### L3 — `src/routes/Signup.tsx` — `setSubmitting(false)` not called on success path
`submitting` stays `true` after `navigate()`. Harmless in practice (component unmounts) but leaves the button in a broken state if navigation ever fails.
**Fix:** Call `setSubmitting(false)` before `navigate`.

### L4 — `ProductDetail.tsx:503` — `FormField` label not wired to its input
`<label>` has no `htmlFor` and the inner input has no `id`. Screen readers won't associate them.
**Fix:** `FormField` should accept an `id` prop (or use `useId()`) and thread it to both `<label htmlFor={id}>` and the child element.

### L5 — `Dashboard.tsx:267-358` — `staggerAttr` indices 5, 6, 7 silently clamp to 4
`motion.ts` clamps to `[1, 4]`, so cards after index 4 all animate with the same 150ms delay instead of progressively longer ones.
**Fix:** Either extend the stagger scale to support higher indices, or cap the Dashboard calls at 4 intentionally and document it.
