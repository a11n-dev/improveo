import { PROFILE_CACHE_KEY } from "~~/shared/constants/cache";

const PROFILE_API_PATH = "/api/profile";

/**
 * Pinia store for profile mutations backed by the shared profile async-data cache.
 */
export const useProfileStore = defineStore("profile", () => {
  const { notifyMessage } = useNotify();
  const { data: profileData } = useNuxtData<ProfileWithSettings | null>(
    PROFILE_CACHE_KEY,
  );

  /** Current profile from async-data cache. */
  const profile = computed<Profile | null>(
    () => profileData.value?.profile ?? null,
  );

  /** Applies immutable updates to the cached profile payload when available. */
  const patchProfileCache = (
    updater: (current: ProfileWithSettings) => ProfileWithSettings,
  ): void => {
    if (!profileData.value) {
      return;
    }

    profileData.value = updater(profileData.value);
  };

  /**
   * Fetches profile/settings payload and hydrates the shared profile cache.
   *
   * @returns The fetched profile or null when loading fails.
   */
  const fetchProfile = async (): Promise<Profile | null> => {
    try {
      const fetchedProfile = await $fetch<ProfileWithSettings>(
        PROFILE_API_PATH,
        {
          headers: import.meta.server
            ? useRequestHeaders(["cookie"])
            : undefined,
        },
      );

      profileData.value = fetchedProfile;
      return fetchedProfile.profile;
    } catch {
      return null;
    }
  };

  /** Clears the shared profile/settings cache. */
  const clearProfile = (): void => {
    profileData.value = null;
  };

  /**
   * Updates profile fields and patches the shared profile cache on success.
   *
   * @param payload Partial profile fields to persist.
   * @returns Updated profile DTO or null when the operation fails.
   */
  const updateProfile = async (
    payload: ProfileUpdatePayload,
  ): Promise<Profile | null> => {
    if (Object.keys(payload).length === 0) {
      return profile.value;
    }

    try {
      const updatedProfile = await $fetch<Profile>(PROFILE_API_PATH, {
        method: "PATCH",
        body: payload,
      });

      patchProfileCache((current) => ({
        ...current,
        profile: updatedProfile,
      }));

      return updatedProfile;
    } catch {
      notifyMessage({ scope: "profile", code: "update_failed" });
      return null;
    }
  };

  /**
   * Deletes the current account and clears profile cache.
   *
   * @returns True when deletion succeeds.
   */
  const deleteProfile = async (): Promise<boolean> => {
    try {
      await $fetch<{ success: boolean }>(PROFILE_API_PATH, {
        method: "DELETE",
      });

      clearProfile();
      notifyMessage({ scope: "profile", code: "account_deleted" });
      return true;
    } catch {
      notifyMessage({ scope: "profile", code: "delete_failed" });
      return false;
    }
  };

  return {
    clearProfile,
    deleteProfile,
    fetchProfile,
    profile,
    updateProfile,
  };
});
