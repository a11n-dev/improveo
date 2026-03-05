// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  ssr: true,

  vite: {
    server: {
      allowedHosts: [".trycloudflare.com"],
    },
  },

  modules: [
    "@nuxt/eslint",
    "@nuxt/test-utils",
    "@pinia/nuxt",
    "@nuxtjs/supabase",
    "@vite-pwa/nuxt",
    "@nuxt/ui",
    "motion-v/nuxt",
  ],

  app: {
    head: {
      meta: [
        {
          name: "viewport",
          content:
            "width=device-width,initial-scale=1,maximum-scale=1.0,viewport-fit=cover",
        },
        { name: "apple-mobile-web-app-capable", content: "yes" },
        {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
        { name: "apple-mobile-web-app-title", content: "Improveo" },
      ],
      link: [
        {
          rel: "apple-touch-icon",
          type: "image/png",
          href: "/apple-touch-icon.png",
        },
      ],
    },
  },

  css: ["~/assets/css/main.css"],

  colorMode: {
    preference: "system",
    fallback: "light",
  },

  supabase: {
    redirect: false,
    types: "~~/shared/types/database.types.ts",
  },

  nitro: {
    storage: {
      redis: {
        driver: "redis",
        url: process.env.REDIS_URL,
      },
    },
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Improveo",
      short_name: "Improveo",
      description: "A modern habit tracking application.",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      start_url: "/",
      scope: "/",
      lang: "en",
      orientation: "portrait",
      icons: [
        {
          src: "pwa-64x64-v2.png",
          sizes: "64x64",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "pwa-192x192-v2.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "pwa-512x512-v2.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any",
        },
        {
          src: "pwa-512x512-maskable-v2.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
      globPatterns: ["**/*.{js,css,html,png,svg,webp,ico,woff,woff2}"],
      skipWaiting: true,
      clientsClaim: true,
      cleanupOutdatedCaches: true,
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 3600, // Check for updates every hour
    },
    devOptions: {
      enabled: process.env.NUXT_PWA_DEV === "true",
      suppressWarnings: true,
      type: "module",
    },
  },
});
