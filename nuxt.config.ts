// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  ssr: true,

  modules: [
    "@nuxt/eslint",
    "@nuxt/test-utils",
    "@nuxtjs/supabase",
    "@vite-pwa/nuxt",
    "@nuxt/ui",
    "@nuxt/fonts",
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
        { name: "apple-mobile-web-app-status-bar-style", content: "default" },
        { name: "apple-mobile-web-app-title", content: "Improveme" },
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

  fonts: {
    families: [
      { name: "Space Grotesk", provider: "google", weights: [400, 500, 600] },
    ],
  },

  pwa: {
    registerType: "autoUpdate",
    manifest: {
      name: "Improveme",
      short_name: "Improveme",
      description: "A modern habit tracking application.",
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
      icons: [
        {
          src: "pwa-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "pwa-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
    },
    workbox: {
      navigateFallback: "/",
    },
    devOptions: {
      enabled: true,
      suppressWarnings: true,
      type: "module",
    },
  },
});
