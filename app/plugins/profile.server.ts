/**
 * Server-only plugin that pre-fetches profile and settings during SSR.
 *
 * Runs after auth middleware has resolved. Skips unauthenticated requests
 * (e.g. /auth page). Pinia stores auto-hydrate to the client, so no
 * client-side counterpart is needed.
 */
export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient();
  const { data } = await supabase.auth.getClaims();

  // Skip for unauthenticated users — nothing to prefetch.
  if (!data?.claims) {
    return;
  }

  const profileStore = useProfileStore();
  const settingsStore = useSettingsStore();

  const [, settings] = await Promise.all([
    profileStore.fetchProfile(),
    settingsStore.fetchSettings(),
  ]);

  // Apply persisted color mode preference during SSR so the initial
  // render matches the user's saved preference (avoids flash).
  if (settings?.colorMode) {
    useColorMode().preference = settings.colorMode;
  }
});
