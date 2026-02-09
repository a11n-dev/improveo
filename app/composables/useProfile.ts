/**
 * Public facade for profile state and profile-related workflows.
 *
 * Keeps a small, stable API at `app/composables` while profile domain
 * implementation lives under `app/composables/profile`.
 */
export const useProfile = () => {
  const profileStore = useProfileStore();
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
  };
};
