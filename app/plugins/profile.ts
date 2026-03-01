/**
 * Loads profile and settings data for authenticated users in both SSR and CSR.
 *
 * - SSR: prefetches data for faster first render.
 * - CSR: loads data after sign-in and resets stores on sign-out.
 */
export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient();
  const profileStore = useProfileStore();
  const settingsStore = useSettingsStore();
  const colorMode = useColorMode();

  onNuxtReady(() => {
    applySettingsColorMode();
  });

  const applySettingsColorMode = (): void => {
    if (settingsStore.settings?.colorMode) {
      colorMode.preference = settingsStore.settings.colorMode;
    }
  };

  const fetchProfileAndSettings = async (): Promise<void> => {
    await profileStore.fetchProfile();
    applySettingsColorMode();
  };

  if (import.meta.server) {
    const { data } = await supabase.auth.getClaims();

    if (!data?.claims) {
      return;
    }

    await fetchProfileAndSettings();
    return;
  }

  if (typeof supabase.auth.getSession !== "function") {
    applySettingsColorMode();
    return;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  if (
    sessionData.session &&
    (!profileStore.profile || !settingsStore.settings)
  ) {
    await fetchProfileAndSettings();
  } else {
    applySettingsColorMode();
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      void fetchProfileAndSettings();
    }
  });
});
