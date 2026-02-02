/**
 * Return type for the useProfile composable.
 */
export interface UseProfileReturn {
  /** The user profile data, or null if not loaded. */
  profile: Ref<Profile | null>;
  /** Whether profile data is being fetched. */
  pending: Ref<boolean>;
  /** Error message if fetch/update failed. */
  error: Ref<string | null>;
  /** Update the week start preference (0 = Sunday, 6 = Saturday). */
  updateWeekStart: (value: number) => Promise<boolean>;
  /** Refresh profile data from the database. */
  refresh: () => Promise<void>;
}

/**
 * Composable for managing user profile data.
 *
 * Fetches profile from the profiles table (linked to auth.users via RLS),
 * provides reactive state for UI consumption, and allows updating
 * the week_start preference.
 *
 * @returns Profile state and methods for data management.
 */
export const useProfile = (): UseProfileReturn => {
  const supabaseClient = useSupabaseClient();
  const { notifyError } = useToastNotify();

  const profile = ref<Profile | null>(null);
  const pending = ref(false);
  const error = ref<string | null>(null);

  /**
   * Maps database row to Profile interface.
   */
  const mapRowToProfile = (row: Record<string, unknown>): Profile => ({
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    weekStart: Number(row.week_start),
    createdAt: String(row.created_at),
  });

  /**
   * Fetches the current user's profile from Supabase.
   */
  const fetchProfile = async (): Promise<void> => {
    pending.value = true;
    error.value = null;

    try {
      const { data: userData } = await supabaseClient.auth.getUser();
      const user = userData?.user;

      if (!user) {
        error.value = "User not authenticated";
        pending.value = false;
        return;
      }

      const { data, error: dbError } = await supabaseClient
        .from("profiles")
        .select("id, email, name, week_start, created_at")
        .eq("id", user.id)
        .single();

      if (dbError) {
        error.value = dbError.message;
        notifyError("Failed to load profile", dbError.message);
        pending.value = false;
        return;
      }

      if (data) {
        profile.value = mapRowToProfile(data as Record<string, unknown>);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      error.value = message;
      notifyError("Profile error", message);
    } finally {
      pending.value = false;
    }
  };

  /**
   * Updates the week_start preference in the database.
   *
   * @param value - Week start day (0 = Sunday, 6 = Saturday).
   * @returns True if update succeeded, false otherwise.
   */
  const updateWeekStart = async (value: number): Promise<boolean> => {
    if (!profile.value) {
      notifyError("Update failed", "Profile not loaded");
      return false;
    }

    if (value < 0 || value > 6) {
      notifyError(
        "Invalid value",
        "Week start must be between 0 (Sunday) and 6 (Saturday)",
      );
      return false;
    }

    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ week_start: value })
      .eq("id", profile.value.id);

    if (updateError) {
      notifyError("Update failed", updateError.message);
      return false;
    }

    // Optimistically update local state
    profile.value.weekStart = value;

    // Refresh habits data to reflect new weekStart in graphs
    await refreshNuxtData("habits");

    return true;
  };

  /**
   * Refreshes profile data from the database.
   */
  const refresh = async (): Promise<void> => {
    await fetchProfile();
  };

  // Fetch profile on initialization
  onMounted(() => {
    void fetchProfile();
  });

  return {
    error,
    pending,
    profile,
    refresh,
    updateWeekStart,
  };
};
