# AGENTS

Purpose: quick operational guide for coding agents in this repo.
Scope: Nuxt 4 app with Tailwind v4, Vitest, Playwright.

## Repository layout

- `app/` holds the Nuxt app entrypoint and assets.
- `app/app.vue` is the root component.
- `app/assets/css/main.css` is the Tailwind v4 entry (`@import "tailwindcss"`).
- `test/unit` and `test/nuxt` are Vitest roots (see `vitest.config.ts`).
- `tests/` is the Playwright test directory (see `playwright.config.ts`).

## Dev and build

- Dev server: `pnpm dev`.
- Build: `pnpm build`.
- Preview build: `pnpm preview`.
- Postinstall (runs automatically): `pnpm postinstall` (`nuxt prepare`).

## Lint, format, and typecheck

- Lint: `pnpm lint` (ESLint via `@nuxt/eslint`).
- Format: `pnpm format` (Prettier defaults; no custom config).
- Type check: `pnpm type-check` (Nuxt type checker).
- After implementation, run `pnpm lint`, `pnpm type-check`, `pnpm format`, `pnpm test:unit`, `pnpm test:nuxt` and report results (or note if skipped).

## Tests

- All unit + Nuxt tests: `pnpm test` (Vitest).
- Watch: `pnpm test:watch`.
- Coverage: `pnpm test:coverage`.
- Unit project only: `pnpm test:unit`.
- Nuxt project only: `pnpm test:nuxt`.
- E2E: `pnpm test:e2e` (Playwright).

## Single-test recipes

- Vitest single file (unit): `pnpm vitest --project unit test/unit/foo.test.ts`.
- Vitest single file (nuxt): `pnpm vitest --project nuxt test/nuxt/foo.spec.ts`.
- Vitest name filter: `pnpm vitest --project unit -t "case name"`.
- Playwright single file: `pnpm playwright test tests/foo.spec.ts`.
- Playwright name filter: `pnpm playwright test -g "case name"`.

## DB types generation

- Supabase types: `pnpm run supabase:gen:types`.

## Code style guidelines

- Follow Nuxt 4 conventions and auto-imports; prefer framework composables where available.
- Format with Prettier; do not hand-format around it.
- Prefer explicit, named exports except where Nuxt expects default exports (e.g., config files).
- Use `import type` for TypeScript-only types to keep runtime bundles clean.
- Keep imports grouped by source: built-in, third-party, then local (separate with blank lines if needed).
- Order named imports alphabetically when touched; avoid mixing type and value imports in one statement.
- Use descriptive, domain-specific names; avoid single-letter identifiers outside short loops.
- File naming: components in PascalCase; composables in `useXxx.ts`; tests in `*.test.ts` or `*.spec.ts`.
- Vue SFCs: use `<script setup>` when adding logic; keep template, script, and style sections clean.
- Keep props, emits, and slots typed; prefer `defineProps` and `defineEmits` generics.
- Avoid implicit `any`; tighten types in composables and utilities.
- Favor `const` and immutable data; reassign only when necessary.
- Document non-obvious or complex logic with JSDoc/TSDoc comments, focusing on intent, assumptions, edge cases, and side effects. Avoid comments that merely restate the code or types.

## Error handling and logging

- Use Nuxt helpers (`createError`, `showError`, `useError`) for user-visible errors.
- For server routes, return proper HTTP status codes and structured error messages.
- Avoid swallowing errors; log context once and rethrow or surface to the UI.
- In tests, assert on error messages or codes rather than generic failures.

## Data and state

- Use `useState` for shared client state; use `useAsyncData`/`useFetch` for data fetching.
- Keep server-only logic in `server/` and client-only logic behind `process.client` checks.
- Prefer composables for cross-component logic and keep components focused on UI.
- Use optimistic updates by mutating the keyed async‑data cache via `useNuxtData` (from `useAsyncData`/`useFetch`) or local state, and roll back on failure.

## Styling

- Tailwind v4 is enabled via `@tailwindcss/vite`; keep global CSS in `app/assets/css/main.css`.
- Prefer utility classes for layout/spacing; create components for repeated patterns.
- Use CSS variables for theming when needed; avoid inline styles unless dynamic.
- Prefer Nuxt UI semantic colors (`text-muted`, `text-highlighted`, `bg-default`, `text-error`) over hard-coded color classes.

## Testing conventions

- Unit tests live in `test/unit`; Nuxt integration tests in `test/nuxt`.
- Playwright tests live in `tests/` and run against Nuxt via `@nuxt/test-utils`.
- Use `.test.ts` or `.spec.ts` suffixes to match Vitest include globs.
- Prefer deterministic tests: avoid timers/network unless mocked.

## Nuxt conventions

- Use the `app/` directory layout (Nuxt 4) for `pages/`, `layouts/`, `components/`, and `composables/`.
- Prefer file-based routing under `app/pages/` when building pages.
- Use `app/layouts/` for shared chrome; keep layout logic minimal.
- Use `app/middleware/` for route guards; keep middleware side-effect free.
- Use `app/plugins/` for client/server plugins; suffix with `.client` or `.server` when needed.
- Use `server/api/` for REST API endpoints.
- Keep server handlers stateless and return JSON-serializable data.

## Nuxt UI usage

- Use Nuxt UI components as the primary UI primitives.
- Keep component overrides minimal; prefer theming via Nuxt UI config and CSS variables.

## TypeScript guidance

- Use `defineProps`/`defineEmits` types for Vue components.
- Prefer type aliases for object shapes and interfaces for public contracts when needed.
- Use `as const` to preserve literal types for config objects.
- Avoid `any`; use `unknown` and narrow with type guards.
- Keep runtime validation at boundaries (API responses, form input).

## Types Organization

- Shared, cross-runtime types (DTOs, API contracts, domain models) live in `shared/types/` and are auto-imported in both client and server.
- Server-only types (Nitro handlers/services, server context, server config) live in `server/types/` and are only available in server context. Should be imported manually.
- UI/client-only types (component/view models, chart configs, browser-related types) live in `app/types/` and are only available in client context. Should be imported manually.
- Prefer grouping by domain (e.g. `shared/types/user.ts`, `shared/types/trading.ts`) over dumping into a single `types.ts`.

## Naming conventions

- Components: `PascalCase.vue` and `<MyComponent />` in templates.
- Composables: `useXxx` (file and function).
- Stores/state: `useXxxStore` if a store pattern is added.
- Boolean variables: `isX`, `hasX`, `shouldX`.
- Event handlers: `onXxx`.
- Constants: `SCREAMING_SNAKE_CASE` only for true constants.

## Environment and config

- Keep secrets in `.env` (not tracked); prefer `runtimeConfig` in `nuxt.config.ts`.
- Avoid reading `process.env` directly in client code; use Nuxt runtime config.
- Regenerate `.nuxt` artifacts with `pnpm postinstall` if types drift.
