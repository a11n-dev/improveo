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

  /** Applies the persisted color mode preference to Nuxt color-mode state. */
  const applySettingsColorMode = (): void => {
    if (settingsStore.settings?.colorMode) {
      colorMode.preference = settingsStore.settings.colorMode;
    }
  };

  /** Fetches profile/settings and reapplies color mode after hydration. */
  const fetchProfileAndSettings = async (): Promise<void> => {
    await profileStore.fetchProfile();
    applySettingsColorMode();
  };

  /** Clears profile-related client stores after sign-out. */
  const resetProfileState = (): void => {
    profileStore.profile = null;
    settingsStore.settings = null;
  };

  /** Resolves whether the current request/session is authenticated. */
  const resolveAuthenticated = async (): Promise<boolean> => {
    const { data } = await supabase.auth.getClaims();
    return Boolean(data?.claims);
  };

  if (import.meta.client) {
    /** Keep Nuxt color-mode in sync with persisted settings updates. */
    watch(
      () => settingsStore.settings?.colorMode,
      (value) => {
        if (!value) {
          return;
        }

        colorMode.preference = value;
      },
      { immediate: true },
    );
  }

  onNuxtReady(() => {
    applySettingsColorMode();
  });

  const isAuthenticated = await resolveAuthenticated();

  if (isAuthenticated && (!profileStore.profile || !settingsStore.settings)) {
    await fetchProfileAndSettings();
  } else {
    applySettingsColorMode();
  }

  if (import.meta.server) {
    return;
  }

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_IN" && session) {
      void fetchProfileAndSettings();
      return;
    }

    if (event === "SIGNED_OUT") {
      resetProfileState();
    }
  });
});
