const PROFILE_KEY = "profile";

/**
 * Composable for managing user profile data.
 *
 * Fetches profile via server API for SSR-friendly data loading,
 * provides reactive state for UI consumption, and allows updating
 * the week_start preference.
 *
 * @returns Profile state and methods for data management.
 */
export const useProfile = () => {
  const { notifyError } = useToastNotify();
  const { data: cachedProfile } = useNuxtData<Profile | null>(PROFILE_KEY);

  const { data, status, error, refresh } = useAsyncData<Profile | null>(
    PROFILE_KEY,
    () =>
      $fetch<Profile>("/api/profile", {
        headers: useRequestHeaders(["cookie"]),
      }),
    {
      default: () => cachedProfile.value ?? null,
    },
  );

  const profile = computed(() => data.value ?? null);
  const pending = computed(() => status.value === "pending");

  const updateWeekStart = async (value: number): Promise<boolean> => {
    if (!profile.value) {
      notifyError("Update failed", "Profile not loaded");
      return false;
    }

    if (value < 0 || value > 6) {
      notifyError("Invalid value", "Week start must be between 0 and 6");
      return false;
    }

    try {
      const updated = await $fetch<Profile>("/api/profile", {
        method: "PATCH",
        body: { weekStart: value },
      });

      data.value = updated;

      await refreshNuxtData("habits");
      return true;
    } catch {
      notifyError("Update failed", "Please try again.");
      return false;
    }
  };

  return {
    error,
    pending,
    profile,
    refresh,
    updateWeekStart,
  };
};
