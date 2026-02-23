import type { Ref } from "vue";

import { useProfileAvatarDraft } from "./useProfileAvatarDraft";
import { useProfileAvatarStorage } from "./useProfileAvatarStorage";
import { useProfileNameDraft } from "./useProfileNameDraft";

/**
 * Manages account editor state and actions for profile settings UI.
 */
export const useProfileAccountEditor = (profile: Ref<Profile>) => {
  const profileStore = useProfileStore();
  const { notifyMessage } = useNotify();
  const supabaseClient = useSupabaseClient();

  const open = ref(false);
  const isSaving = ref(false);
  const isDeleting = ref(false);
  const showDeleteConfirm = ref(false);

  const nameDraft = useProfileNameDraft(profile);
  const avatarDraft = useProfileAvatarDraft(profile, nameDraft.normalizedName);
  const avatarStorage = useProfileAvatarStorage();

  const hasAvatarRemoval = computed(
    () =>
      avatarDraft.removeCurrentAvatar.value &&
      Boolean(profile.value.avatarPath),
  );

  const hasUnsavedChanges = computed(
    () =>
      nameDraft.hasNameChange.value ||
      Boolean(avatarDraft.selectedAvatarFile.value) ||
      hasAvatarRemoval.value,
  );

  const canSave = computed(
    () =>
      hasUnsavedChanges.value &&
      !nameDraft.nameError.value &&
      !showDeleteConfirm.value &&
      !isSaving.value &&
      !isDeleting.value,
  );

  const resetDrafts = (): void => {
    nameDraft.resetNameDraft();
    avatarDraft.resetAvatarDraft();
    showDeleteConfirm.value = false;
  };

  /** Initialize when opening */
  watch(open, (value) => {
    if (value) {
      resetDrafts();
    }
  });

  const buildProfilePayload = async (): Promise<{
    payload: ProfileUpdatePayload;
    uploadedAvatarPath: string | null;
  }> => {
    const payload: ProfileUpdatePayload = {};
    let uploadedAvatarPath: string | null = null;

    if (nameDraft.hasNameChange.value) {
      payload.name = nameDraft.normalizedName.value;
    }

    if (avatarDraft.selectedAvatarFile.value) {
      uploadedAvatarPath = await avatarStorage.uploadAvatar(
        profile.value.id,
        avatarDraft.selectedAvatarFile.value,
      );
      payload.avatarPath = uploadedAvatarPath;
    } else if (hasAvatarRemoval.value) {
      payload.avatarPath = null;
    }

    return {
      payload,
      uploadedAvatarPath,
    };
  };

  const shouldCleanupPreviousAvatar = (
    previousAvatarPath: string,
    uploadedAvatarPath: string | null,
    wasAvatarRemoved: boolean,
  ): boolean => {
    if (wasAvatarRemoved) {
      return true;
    }

    return Boolean(
      uploadedAvatarPath && uploadedAvatarPath !== previousAvatarPath,
    );
  };

  const saveAccount = async (): Promise<void> => {
    if (!canSave.value) {
      return;
    }

    isSaving.value = true;

    let uploadedAvatarPath: string | null = null;

    try {
      const previousAvatarPath = profile.value.avatarPath;
      const wasAvatarRemoved = hasAvatarRemoval.value;
      const payloadState = await buildProfilePayload();

      uploadedAvatarPath = payloadState.uploadedAvatarPath;

      const hasProfilePayload = Object.keys(payloadState.payload).length > 0;

      if (hasProfilePayload) {
        const updatedProfile = await profileStore.updateProfile(
          payloadState.payload,
        );

        if (!updatedProfile) {
          if (uploadedAvatarPath) {
            await avatarStorage.removeAvatarObject(uploadedAvatarPath);
          }

          notifyMessage({ scope: "profile", code: "update_failed" });
          return;
        }
      }

      if (
        previousAvatarPath &&
        shouldCleanupPreviousAvatar(
          previousAvatarPath,
          uploadedAvatarPath,
          wasAvatarRemoved,
        )
      ) {
        await avatarStorage.removeAvatarObject(previousAvatarPath);
      }

      if (hasProfilePayload) {
        notifyMessage({ scope: "profile", code: "account_updated" });
      }

      open.value = false;
    } catch (error) {
      if (uploadedAvatarPath) {
        await avatarStorage.removeAvatarObject(uploadedAvatarPath);
      }

      notifyMessage({
        scope: "profile",
        code: "update_failed_with_message",
        params: {
          message: error instanceof Error ? error.message : "Please try again.",
        },
      });
    } finally {
      isSaving.value = false;
    }
  };

  const handleDelete = (): void => {
    showDeleteConfirm.value = true;
  };

  const cancelDelete = (): void => {
    if (isDeleting.value) {
      return;
    }

    showDeleteConfirm.value = false;
  };

  const confirmDelete = async (): Promise<void> => {
    if (isDeleting.value) {
      return;
    }

    isDeleting.value = true;

    try {
      const deleted = await profileStore.deleteProfile();

      if (!deleted) {
        notifyMessage({ scope: "profile", code: "delete_failed" });
        return;
      }

      notifyMessage({ scope: "profile", code: "account_deleted" });
      showDeleteConfirm.value = false;
      open.value = false;
      await supabaseClient.auth.signOut({ scope: "global" });
      await navigateTo("/auth", { replace: true });
    } finally {
      isDeleting.value = false;
    }
  };

  return {
    avatarAlt: avatarDraft.avatarAlt,
    avatarUrl: avatarDraft.avatarUrl,
    canSave,
    cancelDelete,
    confirmDelete,
    draftName: nameDraft.draftName,
    handleDelete,
    hasUnsavedChanges,
    hasStoredAvatar: avatarDraft.hasStoredAvatar,
    isDeleting,
    isSaving,
    markAvatarForRemoval: avatarDraft.markAvatarForRemoval,
    nameError: nameDraft.nameError,
    open,
    removeCurrentAvatar: avatarDraft.removeCurrentAvatar,
    resetDrafts,
    saveAccount,
    selectedAvatarFile: avatarDraft.selectedAvatarFile,
    showDeleteConfirm,
  };
};
