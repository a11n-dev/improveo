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

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your Supabase credentials:

    ```env
    SUPABASE_URL=your_supabase_url
    SUPABASE_KEY=your_supabase_anon_key
    ```

4.  **Start Development Server:**
    ```bash
    pnpm dev
    ```
    The app will be available at `http://localhost:3000`.

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
