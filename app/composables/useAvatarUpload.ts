import {
  ALLOWED_AVATAR_MIME_TYPES,
  MAX_AVATAR_FILE_SIZE,
} from "~~/shared/constants/avatar";
import { AVATAR_BUCKET } from "~~/shared/constants/storage";

/**
 * Provides avatar upload/removal orchestration for profile settings.
 *
 * @returns Avatar file state and upload/remove actions.
 */
export const useAvatarUpload = () => {
  const profileStore = useProfileStore();
  const { notifyMessage } = useNotify();
  const supabaseClient = useSupabaseClient();
  const { profile } = storeToRefs(profileStore);

  const selectedAvatarFile = ref<File | null>(null);
  const avatarPreviewUrl = ref<string | null>(null);
  const isRemoving = ref(false);
  const isUploading = ref(false);

  /** Resolves a safe storage extension from file metadata. */
  const getAvatarExtension = (file: File): string => {
    const fileNameExtension = file.name.split(".").pop()?.toLowerCase();

    if (fileNameExtension === "jpg" || fileNameExtension === "jpeg") {
      return "jpg";
    }

    if (fileNameExtension === "png" || fileNameExtension === "webp") {
      return fileNameExtension;
    }

    if (file.type === "image/png") {
      return "png";
    }

    if (file.type === "image/webp") {
      return "webp";
    }

    return "jpg";
  };

  /** Releases temporary object URL memory when preview changes or unmounts. */
  const clearAvatarPreview = (): void => {
    if (!avatarPreviewUrl.value) {
      return;
    }

    URL.revokeObjectURL(avatarPreviewUrl.value);
    avatarPreviewUrl.value = null;
  };

  /** Removes an avatar object from storage with best-effort error reporting. */
  const removeAvatarObject = async (avatarPath: string): Promise<void> => {
    const { error } = await supabaseClient.storage
      .from(AVATAR_BUCKET)
      .remove([avatarPath]);

    if (error) {
      notifyMessage({ scope: "profile", code: "avatar_cleanup_failed" });
    }
  };

  /** Uploads an avatar object and returns its storage path. */
  const uploadAvatarObject = async (
    file: File,
    userId: string,
  ): Promise<string> => {
    const extension = getAvatarExtension(file);
    const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabaseClient.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
        cacheControl: "3600",
      });

    if (error) {
      throw new Error(error.message);
    }

    return filePath;
  };

  /**
   * Uploads a new avatar immediately and persists profile changes.
   *
   * If profile update fails after upload, the new storage object is rolled back.
   *
   * @param file Selected avatar file.
   */
  const saveSelectedAvatar = async (file: File): Promise<void> => {
    if (!profile.value || isUploading.value) {
      return;
    }

    if (
      !ALLOWED_AVATAR_MIME_TYPES.has(file.type) ||
      file.size > MAX_AVATAR_FILE_SIZE
    ) {
      notifyMessage({
        scope: "profile",
        code: "update_failed_with_message",
        params: {
          message: "Use JPG, PNG, or WEBP images up to 3 MB.",
        },
      });

      selectedAvatarFile.value = null;
      clearAvatarPreview();
      return;
    }

    isUploading.value = true;

    const previousAvatarPath = profile.value.avatarPath;
    let uploadedAvatarPath: string | null = null;

    try {
      uploadedAvatarPath = await uploadAvatarObject(file, profile.value.id);

      const updatedProfile = await profileStore.updateProfile({
        avatarPath: uploadedAvatarPath,
      });

      if (!updatedProfile) {
        if (uploadedAvatarPath) {
          await removeAvatarObject(uploadedAvatarPath);
        }

        notifyMessage({ scope: "profile", code: "update_failed" });
        return;
      }

      if (previousAvatarPath && previousAvatarPath !== uploadedAvatarPath) {
        await removeAvatarObject(previousAvatarPath);
      }
    } catch (caughtError) {
      if (uploadedAvatarPath) {
        await removeAvatarObject(uploadedAvatarPath);
      }

      notifyMessage({
        scope: "profile",
        code: "update_failed_with_message",
        params: {
          message:
            caughtError instanceof Error
              ? caughtError.message
              : "Please try again.",
        },
      });
    } finally {
      isUploading.value = false;
      selectedAvatarFile.value = null;
      clearAvatarPreview();
    }
  };

  /**
   * Clears persisted avatar and removes storage object best-effort.
   *
   * @returns True when profile update succeeds.
   */
  const handleRemoveAvatar = async (): Promise<boolean> => {
    if (!profile.value?.avatarPath || isUploading.value || isRemoving.value) {
      return false;
    }

    isRemoving.value = true;
    const previousAvatarPath = profile.value.avatarPath;

    try {
      const updatedProfile = await profileStore.updateProfile({
        avatarPath: null,
      });

      if (!updatedProfile) {
        notifyMessage({ scope: "profile", code: "update_failed" });
        return false;
      }

      await removeAvatarObject(previousAvatarPath);
      return true;
    } finally {
      isRemoving.value = false;
      selectedAvatarFile.value = null;
      clearAvatarPreview();
    }
  };

  /** Creates preview and starts upload whenever user selects a new avatar file. */
  watch(
    selectedAvatarFile,
    (file) => {
      if (!file) {
        return;
      }

      clearAvatarPreview();
      avatarPreviewUrl.value = URL.createObjectURL(file);
      void saveSelectedAvatar(file);
    },
    { flush: "post" },
  );

  onBeforeUnmount(() => {
    clearAvatarPreview();
  });

  return {
    avatarPreviewUrl,
    clearAvatarPreview,
    handleRemoveAvatar,
    isRemoving,
    isUploading,
    saveSelectedAvatar,
    selectedAvatarFile,
  };
};
