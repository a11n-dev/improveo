import type { Ref } from "vue";

import { useProfileAvatarDraft } from "./useProfileAvatarDraft";
import { useProfileAvatarStorage } from "./useProfileAvatarStorage";
import { useProfileNameDraft } from "./useProfileNameDraft";

/**
 * Manages account editor state and actions for profile settings UI.
 */
export const useProfileAccountEditor = (profile: Ref<Profile>) => {
  const profileStore = useProfileStore();
  const { notifyError, notifySuccess } = useToastNotify();
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

  const canSave = computed(
    () =>
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

  watch(open, (value) => {
    if (value) {
      resetDrafts();
      return;
    }

    avatarDraft.resetAvatarDraft();
    showDeleteConfirm.value = false;
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
  ): boolean => {
    if (hasAvatarRemoval.value) {
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

          notifyError("Update failed", "Please try again.");
          return;
        }
      }

      if (
        previousAvatarPath &&
        shouldCleanupPreviousAvatar(previousAvatarPath, uploadedAvatarPath)
      ) {
        await avatarStorage.removeAvatarObject(previousAvatarPath);
      }

      if (hasProfilePayload) {
        notifySuccess("Account updated", "Your profile changes were saved.");
      }

      open.value = false;
    } catch (error) {
      if (uploadedAvatarPath) {
        await avatarStorage.removeAvatarObject(uploadedAvatarPath);
      }

      notifyError(
        "Update failed",
        error instanceof Error ? error.message : "Please try again.",
      );
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
        notifyError("Delete failed", "Please try again.");
        return;
      }

      notifySuccess("Account deleted", "Your data has been removed.");
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
    hasStoredAvatar: avatarDraft.hasStoredAvatar,
    isDeleting,
    isSaving,
    markAvatarForRemoval: avatarDraft.markAvatarForRemoval,
    nameError: nameDraft.nameError,
    open,
    removeCurrentAvatar: avatarDraft.removeCurrentAvatar,
    saveAccount,
    selectedAvatarFile: avatarDraft.selectedAvatarFile,
    showDeleteConfirm,
  };
};
