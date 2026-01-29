// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  
  modules: ["@nuxt/eslint", "@nuxt/test-utils", "@nuxtjs/supabase", "@vite-pwa/nuxt", "@nuxt/ui"],

  css: ["~/assets/css/main.css"],

  colorMode: {
    preference: "system",
    fallback: "light",
  },

  supabase: {
    redirect: false,
    types: "~~/shared/types/database.types.ts",
  },
});
