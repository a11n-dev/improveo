import { HABITS_CACHE_KEY, PROFILE_CACHE_KEY } from "~~/shared/constants/cache";

const SETTINGS_API_PATH = "/api/profile/settings";

/**
 * Pinia store for settings mutations backed by the shared profile async-data cache.
 */
export const useSettingsStore = defineStore("settings", () => {
  const { notifyMessage } = useNotify();
  const { data: profileData } = useNuxtData<ProfileWithSettings | null>(
    PROFILE_CACHE_KEY,
  );

  /** Current settings from async-data cache. */
  const settings = computed<ProfileSettings | null>(
    () => profileData.value?.settings ?? null,
  );

  /** True when animations should be reduced according to user preferences. */
  const reduceAnimationsEnabled = computed<boolean>(
    () => settings.value?.reduceAnimations ?? false,
  );

  /**
   * Updates settings with optimistic cache state and server validation.
   *
   * @param payload Partial settings payload.
   * @returns Updated settings on success, null on failure.
   */
  const updateSettings = async (
    payload: ProfileSettingsUpdatePayload,
  ): Promise<ProfileSettings | null> => {
    const currentSettings = settings.value;

    if (!currentSettings) {
      return null;
    }

    if (Object.keys(payload).length === 0) {
      return currentSettings;
    }

    const previousSettings = { ...currentSettings };

    if (profileData.value) {
      profileData.value = {
        ...profileData.value,
        settings: {
          ...profileData.value.settings,
          ...(payload.colorMode !== undefined && {
            colorMode: payload.colorMode as ColorModePreference,
          }),
          ...(payload.reduceAnimations !== undefined && {
            reduceAnimations: payload.reduceAnimations,
          }),
          ...(payload.weekStart !== undefined && {
            weekStart: payload.weekStart,
          }),
        },
      };
    }

    try {
      const updated = await $fetch<ProfileSettings>(SETTINGS_API_PATH, {
        method: "PATCH",
        body: payload,
      });

      if (profileData.value) {
        profileData.value = {
          ...profileData.value,
          settings: updated,
        };
      }

      return updated;
    } catch {
      if (profileData.value) {
        profileData.value = {
          ...profileData.value,
          settings: previousSettings,
        };
      }

      notifyMessage({ scope: "settings", code: "update_failed" });
      return null;
    }
  };

  /**
   * Convenience: update week start day.
   *
   * @param value Week start index (0..6).
   * @returns True on success, false on failure.
   */
  const updateWeekStart = async (value: number): Promise<boolean> => {
    if (value < 0 || value > 6) {
      notifyMessage({ scope: "settings", code: "invalid_value" });
      return false;
    }

    const result = await updateSettings({ weekStart: value });

    if (!result) {
      return false;
    }

    await refreshNuxtData(HABITS_CACHE_KEY);
    return true;
  };

  /**
   * Convenience: update color mode preference.
   *
   * @param value Target color mode preference.
   * @returns True on success.
   */
  const updateColorMode = async (
    value: ColorModePreference,
  ): Promise<boolean> => {
    const result = await updateSettings({ colorMode: value });
    return result !== null;
  };

  /**
   * Convenience: update motion reduction preference.
   *
   * @param value Motion reduction preference.
   * @returns True on success.
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
