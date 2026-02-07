# Improveo

Improveo is a modern habit tracking application designed to help you build and maintain positive routines.

## ✨ Features

- **Habit Management**: Create, update, and delete habits with ease.
- **Customization**: Personalize habits with icons, colors, and descriptions.
- **Streak Tracking**: Visualize your progress with current and best streak counters.
- **Daily Dashboard**: Quick check-ins to mark habits as complete for the day.
- **PWA Support**: Installable on mobile and desktop for a native-like experience.

## 🚀 Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd improveo
    ```

2.  **Install dependencies:**

    ```bash
    pnpm install
    ```

    If `supabase` is not available after install, run:

    ```bash
    pnpm approve-builds
    pnpm rebuild supabase
    ```

3.  **Install and start Docker:**
    Local Supabase runs in Docker containers, so Docker Desktop (or Docker Engine) must be installed and running.

4.  **Run one-time local setup:**

    ```bash
    pnpm run setup:reset
    ```

    This command will:
    - start local Supabase
    - sync local Supabase credentials into `.env` and `.env.test`
    - reset and seed the local database

    Use `pnpm run setup` when you only want to start local Supabase and sync env files without resetting data.

5.  **Start Development Server:**

    ```bash
    pnpm run dev:local
    ```

    The app will be available at `http://localhost:3000`.

    PWA service worker is disabled by default in development. Set `NUXT_PWA_DEV=true` only when you need to test PWA behavior.

## 🗄️ Supabase Commands

```bash
# Start local Supabase stack
pnpm run supabase:start

# Stop local Supabase stack
pnpm run supabase:stop

# Show local Supabase status
pnpm run supabase:status

# Sync local Supabase credentials into .env and .env.test
pnpm run supabase:env:sync

# Reset local DB and re-run migrations/seeds
pnpm run supabase:reset
```

## 🔐 Environment Variables

Local development env vars are generated automatically from `supabase status -o env`.
If you ever need to refresh them manually, run:

```bash
pnpm run supabase:env:sync
```

## 🧪 Testing

Run the test suite to ensure everything is working correctly:

```bash
# Unit & Component Tests
pnpm test

# E2E Tests
pnpm test:e2e
```

## 📦 Build for Production

```bash
pnpm build
```

## 📄 Copyright

**Copyright © 2026. All Rights Reserved.**
