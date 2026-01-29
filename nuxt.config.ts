// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },

  modules: [
    "@nuxt/eslint",
    "@nuxt/test-utils",
    "@nuxtjs/supabase",
    "@vite-pwa/nuxt",
    "@nuxt/ui",
    "@nuxt/fonts",
  ],

  css: ["~/assets/css/main.css"],

  colorMode: {
    preference: "system",
    fallback: "light",
  },

  supabase: {
    redirectOptions: {
      login: "/auth",
      callback: "/auth/confirm",
    },
    types: "~~/shared/types/database.types.ts",
  },

  fonts: {
    families: [
      { name: "Space Grotesk", provider: "google", weights: [400, 500, 600] },
    ],
  },
});
