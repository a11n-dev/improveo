const PROFILE_API_PATH = "/api/profile";

/**
 * Pinia store for managing user profile state, including fetching, updating, and deleting the profile. Provides methods for updating specific profile fields and handles loading and error states.
 */
export const useProfileStore = defineStore("profile", () => {
  const profile = ref<Profile | null>(null);
  const pending = ref(false);
  const error = ref<string | null>(null);

  /**
   * Fetches the user's profile from the server and updates the store state.
   * @returns The fetched Profile object or null if an error occurred.
   */
  const fetchProfile = async (): Promise<Profile | null> => {
    pending.value = true;
    error.value = null;

    try {
      const fetchedProfile = await $fetch<Profile>(PROFILE_API_PATH, {
        headers: useRequestHeaders(["cookie"]),
      });

      profile.value = fetchedProfile;
      return fetchedProfile;
    } catch (caughtError) {
      error.value =
        caughtError instanceof Error
          ? caughtError.message
          : "Failed to fetch profile";
      return null;
    } finally {
      pending.value = false;
    }
  };

  /**
   * Updates the user's profile with the provided payload. Only sends fields that are being updated.
   * @param payload An object containing the profile fields to update.
   * @returns The updated Profile object or null if an error occurred or if no profile exists.
   */
  const updateProfile = async (
    payload: ProfileUpdatePayload,
  ): Promise<Profile | null> => {
    if (!profile.value) {
      return null;
    }

    if (Object.keys(payload).length === 0) {
      return profile.value;
    }

    try {
      const updatedProfile = await $fetch<Profile>(PROFILE_API_PATH, {
        method: "PATCH",
        body: payload,
      });

      profile.value = updatedProfile;
      return updatedProfile;
    } catch {
      return null;
    }
  };

  /**
   * Deletes the user's profile from the server and clears the profile state in the store.
   * @returns True if the profile was successfully deleted, false if the delete request failed.
   */
  const deleteProfile = async (): Promise<boolean> => {
    try {
      await $fetch<{ success: boolean }>(PROFILE_API_PATH, {
        method: "DELETE",
      });

      profile.value = null;
      return true;
    } catch {
      return false;
    }
  };

  return {
    deleteProfile,
    error,
    fetchProfile,
    pending,
    profile,
    updateProfile,
  };
});
