# AGENTS.md

This file provides guidance for AI coding agents working on the Improveo repository.

## Project Overview

Main stack:

- Nuxt 4 (`ssr: true`)
- TypeScript (strict)
- Supabase
- Pinia
- Nuxt UI + Tailwind CSS
- Motion (`motion-v`)
- Vite PWA
- Vitest (unit + Nuxt projects) and Playwright
- Redis (optional local container)
- ESLint + Prettier

## Project Structure

```text
app/
  assets/css/main.css          # Global styles
  components/                  # UI components (auth, common, habits, profile)
  composables/                 # Reusable composables (use*.ts)
  layouts/                     # App layouts
  middleware/                  # Route middleware
  pages/                       # File-based routes
  plugins/                     # Nuxt plugins
  services/                    # App services (notifications, toast)
  stores/                      # Pinia stores
  types/                       # Client/UI-only types
  utils/                       # Client utilities

server/
  api/                         # Nitro API endpoints
  types/                       # Server-only types
  utils/                       # Server utilities

shared/
  constants/                   # Shared constants
  types/                       # Cross-runtime types
  utils/                       # Shared utilities
  validation/                  # Shared zod validation schemas

supabase/
  migrations/                  # SQL migrations
  seeds/                       # Seed data
  config.toml                  # Local Supabase config

scripts/
  supabase-env-sync.mjs        # Sync local Supabase values to .env/.env.test

test/
  unit/                        # Unit tests (*.test.ts)
  nuxt/                        # Nuxt integration tests (*.test.ts)

tests/                         # Playwright E2E tests
```

## Commands

### Development and Build

```bash
pnpm install                   # Install dependencies
pnpm run dev                   # Start Nuxt dev server
pnpm run dev:local             # Start Supabase + sync env + start Nuxt dev server
pnpm run build                 # Build production bundle
pnpm run preview               # Preview production build locally
pnpm run generate              # Generate static output
pnpm run postinstall           # Run nuxt prepare (refresh generated artifacts)
```

### Setup and Local Services

```bash
pnpm run setup                 # Start local Supabase and sync .env/.env.test
pnpm run setup:reset           # setup + reset local DB and re-seed

pnpm run supabase:start        # Start local Supabase stack
pnpm run supabase:stop         # Stop local Supabase stack
pnpm run supabase:status       # Show local Supabase status
pnpm run supabase:env:sync     # Sync Supabase credentials into .env/.env.test
pnpm run supabase:reset        # Reset local DB and rerun migrations/seeds
pnpm run supabase:gen:types    # Generate shared/types/database.types.ts

pnpm run redis:start           # Start local Redis container (create if missing)
pnpm run redis:stop            # Stop local Redis container
pnpm run redis:logs            # Tail Redis container logs
pnpm run redis:cli             # Open redis-cli inside container
```

### Quality and Tests

```bash
pnpm run lint                  # Run ESLint
pnpm run type-check            # Run Nuxt type checking
pnpm run format                # Format repository with Prettier

pnpm run test                  # Run all Vitest projects
pnpm run test:watch            # Run Vitest in watch mode
pnpm run test:coverage         # Run Vitest with coverage
pnpm run test:unit             # Run unit tests only
pnpm run test:nuxt             # Run Nuxt tests only

pnpm run test:e2e              # Run Playwright E2E suite
pnpm run test:e2e:ui           # Run Playwright in UI mode
```

Single-test recipes:

```bash
pnpm vitest --project unit test/unit/foo.test.ts      # Single unit test file
pnpm vitest --project nuxt test/nuxt/foo.test.ts      # Single Nuxt test file
pnpm vitest --project unit -t "case name"             # Vitest name filter

pnpm playwright test tests/foo.spec.ts                # Single Playwright spec
pnpm playwright test -g "case name"                   # Playwright name filter
```

## Coding Guidelines

- Use TypeScript for all new code; avoid `any`.
- Follow Nuxt 4 `app/` conventions and file-based routing.
- Follow Vue 3, Nuxt 4, Pinia, Supabase and Tailwind best practices.
- Use `<script setup>` for Vue SFC logic.
- Keep components/composables small and focused.
- Keep imports grouped by source (built-in, third-party, local).
- Keep type and value imports separate (`import type { ... }`).
- Use named local types for `defineProps`/`defineEmits`.
- Use `import.meta.client` / `import.meta.server` guards when needed.
- Prefer `runtimeConfig` for app runtime config.
- Using `process.env` is acceptable in config/tooling files (`nuxt.config.ts`, test config, scripts).
- Prefer Nuxt UI semantic color tokens over raw Tailwind palette classes.
- Keep global styles in `app/assets/css/main.css`.
- Reuse schemas from `shared/validation` at request/input boundaries.

## Types and Boundaries

- Keep types grouped by domain (`habit`, `profile`, `settings`, etc.).
- Do not edit `shared/types/database.types.ts` manually; regenerate with `pnpm run supabase:gen:types`.

## Testing Guidelines

- Unit tests live in `test/unit/**/*.test.ts` and run in Node environment.
- Nuxt tests live in `test/nuxt/**/*.test.ts` and run in Nuxt + Happy DOM.
- Playwright tests live in `tests/**/*.spec.ts`.
- Prefer deterministic tests (mock unstable network/timers when needed).
- Assert specific status codes/messages for error paths.
- When changing behavior, add or update tests in the closest relevant layer.

## CI Notes

- CI workflow runs `lint`, `type-check`, and `build`.
- Test workflow runs local Supabase setup/reset, then `test:unit` and `test:nuxt`.
- CI and tests run on `main` and `release` branches.

## Before Submitting

- [ ] `pnpm run lint`
- [ ] `pnpm run type-check`
- [ ] `pnpm run format`
- [ ] `pnpm run test:unit`
- [ ] `pnpm run test:nuxt`
- [ ] `pnpm run test:e2e` (when E2E exists or critical UI flow changed)
- [ ] Updated tests for changed behavior
- [ ] If DB schema changed: migration added, local reset run, DB types regenerated
- [ ] No secrets committed (`.env`, keys, tokens)
- [ ] Mentioned any skipped checks and why
