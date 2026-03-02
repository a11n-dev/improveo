const SETTINGS_API_PATH = "/api/profile/settings";

/**
 * Pinia store for managing user profile settings.
 * Populated during SSR by the profile plugin; updated via PATCH on client.
 */
export const useSettingsStore = defineStore("settings", () => {
  const settings = ref<ProfileSettings | null>(null);

  /** True when animations should be reduced according to user preferences. */
  const reduceAnimationsEnabled = computed<boolean>(
    () => settings.value?.reduceAnimations ?? false,
  );

  /**
   * Updates settings with optimistic state and server validation.
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
      ...(payload.reduceAnimations !== undefined && {
        reduceAnimations: payload.reduceAnimations,
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

  /**
   * Convenience: update motion reduction preference.
   * @returns true on success, false on failure.
   */
  const updateReduceAnimations = async (value: boolean): Promise<boolean> => {
    const result = await updateSettings({ reduceAnimations: value });
    return result !== null;
  };

  return {
    reduceAnimationsEnabled,
    settings,
    updateColorMode,
    updateReduceAnimations,
    updateSettings,
    updateWeekStart,
  };
});
