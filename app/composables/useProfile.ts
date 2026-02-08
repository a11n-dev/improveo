/**
 * Public facade for profile state and profile-related workflows.
 *
 * Keeps a small, stable API at `app/composables` while profile domain
 * implementation lives under `app/composables/profile`.
 */
export const useProfile = () => {
  const profileStore = useProfileStore();
  const { notifyError } = useToastNotify();
  const { error, pending, profile } = storeToRefs(profileStore);

  /**
   * Fetches the authenticated user profile from the API.
   */
  const fetchProfile = async (): Promise<Profile | null> => {
    return profileStore.fetchProfile();
  };

  /**
   * Updates profile fields with server validation.
   */
  const updateProfile = async (
    payload: ProfileUpdatePayload,
  ): Promise<Profile | null> => {
    return profileStore.updateProfile(payload);
  };

  /**
   * Updates week start and emits user-friendly validation errors.
   */
  const updateWeekStart = async (value: number): Promise<boolean> => {
    const isUpdated = await profileStore.updateWeekStart(value);

    if (isUpdated) {
      return true;
    }

    if (value < 0 || value > 6) {
      notifyError("Invalid value", "Choose a day from Monday to Sunday");
      return false;
    }

    notifyError("Update failed", "Please try again.");
    return false;
  };

  /**
   * Permanently deletes the authenticated account profile.
   */
  const deleteProfile = async (): Promise<boolean> => {
    return profileStore.deleteProfile();
  };

  return {
    deleteProfile,
    error,
    fetchProfile,
    pending,
    profile,
    updateProfile,
    updateWeekStart,
  };
};
