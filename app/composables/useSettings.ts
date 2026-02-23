/**
 * Public facade for profile settings state and settings-related workflows.
 *
 * Wraps the settings store with user-friendly toast notifications.
 */
export const useSettings = () => {
  const settingsStore = useSettingsStore();
  const { notifyMessage } = useNotify();
  const { error, pending, settings } = storeToRefs(settingsStore);

  /**
   * Fetches the user's profile settings from the API.
   */
  const fetchSettings = async (): Promise<ProfileSettings | null> => {
    return settingsStore.fetchSettings();
  };

  /**
   * Updates settings fields with server validation.
   */
  const updateSettings = async (
    payload: ProfileSettingsUpdatePayload,
  ): Promise<ProfileSettings | null> => {
    return settingsStore.updateSettings(payload);
  };

  /**
   * Updates week start and emits user-friendly validation errors.
   */
  const updateWeekStart = async (value: number): Promise<boolean> => {
    const isUpdated = await settingsStore.updateWeekStart(value);

    if (isUpdated) {
      return true;
    }

    if (value < 0 || value > 6) {
      notifyMessage({ scope: "settings", code: "invalid_value" });
      return false;
    }

    notifyMessage({ scope: "settings", code: "update_failed" });
    return false;
  };

  /**
   * Updates color mode preference and persists to server.
   */
  const updateColorMode = async (
    value: ColorModePreference,
  ): Promise<boolean> => {
    const isUpdated = await settingsStore.updateColorMode(value);

    if (!isUpdated) {
      notifyMessage({ scope: "settings", code: "update_failed" });
    }

    return isUpdated;
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
};
