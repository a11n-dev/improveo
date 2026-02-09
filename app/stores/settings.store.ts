const SETTINGS_API_PATH = "/api/profile/settings";

/**
 * Pinia store for managing user profile settings (color mode, week start).
 * Populated during SSR by the profile plugin; updated via PATCH on client.
 */
export const useSettingsStore = defineStore("settings", () => {
  const settings = ref<ProfileSettings | null>(null);
  const pending = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetches the user's settings from the server.
   * @returns The fetched ProfileSettings or null on error.
   */
  const fetchSettings = async (): Promise<ProfileSettings | null> => {
    pending.value = true;
    error.value = null;

    try {
      const fetched = await $fetch<ProfileSettings>(SETTINGS_API_PATH, {
        headers: useRequestHeaders(["cookie"]),
      });

      settings.value = fetched;
      return fetched;
    } catch (caughtError) {
      error.value =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to fetch settings";
      return null;
    } finally {
      pending.value = false;
    }
  };

  /**
   * Updates settings with optimistic state and server validation.
   * @param payload Fields to update (colorMode, weekStart).
   * @returns The updated ProfileSettings or null on error.
   */
  const updateSettings = async (
    payload: ProfileSettingsUpdatePayload,
  ): Promise<ProfileSettings | null> => {
    if (!settings.value) {
      return null;
    }

    if (Object.keys(payload).length === 0) {
      return settings.value;
    }

    // Optimistic update
    const previous = { ...settings.value };
    settings.value = {
      ...settings.value,
      ...(payload.colorMode !== undefined && {
        colorMode: payload.colorMode as ColorModePreference,
      }),
      ...(payload.weekStart !== undefined && {
        weekStart: payload.weekStart,
      }),
    };

    try {
      const updated = await $fetch<ProfileSettings>(SETTINGS_API_PATH, {
        method: "PATCH",
        body: payload,
      });

      settings.value = updated;
      return updated;
    } catch {
      // Revert optimistic update
      settings.value = previous;
      return null;
    }
  };

  /**
   * Convenience: update week start day.
   * @returns true on success, false on failure.
   */
  const updateWeekStart = async (value: number): Promise<boolean> => {
    if (value < 0 || value > 6) {
      return false;
    }

    const result = await updateSettings({ weekStart: value });

    if (!result) {
      return false;
    }

    await refreshNuxtData("habits");
    return true;
  };

  /**
   * Convenience: update color mode preference.
   * @returns true on success, false on failure.
   */
  const updateColorMode = async (
    value: ColorModePreference,
  ): Promise<boolean> => {
    const result = await updateSettings({ colorMode: value });
    return result !== null;
  };

  return {
    error,
    fetchSettings,
    pending,
    settings,
    updateColorMode,
    updateSettings,
    updateWeekStart,
  };
});
