---
name: react-mit-standards
description: Use whenever writing React + TypeScript code in this repo. Encodes the MIT-standard patterns this project enforces: TypeScript strict, no any, accessibility-first, tested, design-system-clean.
---

# React MIT Standards (project rules)

## TypeScript

- `strict: true` always. No exceptions.
- No `any`. If you genuinely don't know the type, use `unknown` and narrow.
- No `@ts-ignore`. Use `@ts-expect-error` with a comment explaining why.
- Prefer `interface` for object shapes, `type` for unions/utilities.
- Function return types are explicit on exported functions, optional on local ones.

## Components

- Functional components only. Named exports for components, default export only at route boundaries.
- Props interface declared above the component: `interface FooProps { ... }`
- Children typed as `ReactNode`, never `any` or omitted.
- No prop drilling beyond 2 levels — lift state to context or zustand store.

## Hooks

- Custom hooks start with `use`. They live in `prototype/src/hooks/`.
- Effects have explicit dependency arrays. Never `// eslint-disable-next-line react-hooks/exhaustive-deps` without a comment.
- `useCallback` / `useMemo` only when measurably needed, never preemptively.

## Forms

- Controlled inputs. Always.
- Validation with zod. Schema declared next to the form.
- `<label>` paired with input via `htmlFor`. Always.
- `aria-invalid` and `aria-describedby` for error states.

## Accessibility

- Every interactive element keyboard-accessible.
- Focus visible (`:focus-visible` ring using token).
- `aria-label` on icon-only buttons.
- Semantic HTML always: `<button>` for actions, `<a>` for navigation, `<nav>`, `<main>`, `<header>`, `<form>`.
- Color is never the only signal (icon + color + text for status).

## File header

Every source file starts with:

```tsx
/**
 * @license MIT
 * Copyright (c) 2026 Firat Gomi
 * See LICENSE in the project root.
 */
```

(Run `scripts/add-license-header.sh` to add it to all files at once.)

## Tests

- Vitest + Testing Library.
- File next to component: `Foo.tsx` ↔ `Foo.test.tsx`.
- Test names describe behavior: `it('disables submit when email is invalid')`.
- Selectors prefer `getByRole`, then `getByLabelText`, then `getByText`. `getByTestId` only as last resort.

## Imports

- Order: external → internal (`@/`) → relative.
- No circular imports. Period.
- No barrel files except at package boundaries.

## Naming

- Components: `PascalCase.tsx`
- Hooks: `useCamelCase.ts`
- Utilities: `camelCase.ts`
- Types: `PascalCase` interfaces and types
- Constants: `SCREAMING_SNAKE_CASE`
- CSS classes (when not Tailwind): `kebab-case`
