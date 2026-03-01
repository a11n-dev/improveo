<script setup lang="ts">
import { AVATAR_BUCKET } from "~~/shared/constants/storage";

const MAX_AVATAR_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const profileStore = useProfileStore();
const { notifyMessage } = useNotify();
const supabaseClient = useSupabaseClient();
const { profile } = storeToRefs(profileStore);

const selectedAvatarFile = ref<File | null>(null);
const avatarPreviewUrl = ref<string | null>(null);
const isRemoving = ref(false);
const isUploading = ref(false);

/** Indicates whether avatar interactions should be disabled. */
const isBusy = computed(
  () => profile.value === null || isUploading.value || isRemoving.value,
);

/** Public URL for the active avatar preview or the persisted avatar. */
const avatarUrl = computed(() => {
  if (!profile.value) {
    return undefined;
  }

  return (
    avatarPreviewUrl.value ??
    getAvatarPublicUrl(supabaseClient, profile.value.avatarPath)
  );
});

const avatarAlt = computed(() => profile.value?.username ?? "User");
const hasStoredAvatar = computed(() => Boolean(profile.value?.avatarPath));

const showRemoveAction = computed(
  () => Boolean(selectedAvatarFile.value) || hasStoredAvatar.value,
);

/** Helper text shown under the avatar picker. */
const fileDescription = computed(() => {
  if (isUploading.value) {
    return "Saving avatar...";
  }

  if (selectedAvatarFile.value) {
    return selectedAvatarFile.value.name;
  }

  return "JPG, PNG or WEBP up to 3 MB.";
});

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

const removeAvatarObject = async (avatarPath: string): Promise<void> => {
  const { error } = await supabaseClient.storage
    .from(AVATAR_BUCKET)
    .remove([avatarPath]);

  if (error) {
    notifyMessage({ scope: "profile", code: "avatar_cleanup_failed" });
  }
};

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

/** Clears persisted avatar immediately and removes storage object best-effort. */
const handleRemoveAvatar = async (event: MouseEvent): Promise<void> => {
  event.preventDefault();
  event.stopPropagation();

  if (!profile.value?.avatarPath || isBusy.value) {
    return;
  }

  isRemoving.value = true;
  const previousAvatarPath = profile.value.avatarPath;

  try {
    const updatedProfile = await profileStore.updateProfile({
      avatarPath: null,
    });

    if (!updatedProfile) {
      notifyMessage({ scope: "profile", code: "update_failed" });
      return;
    }

    await removeAvatarObject(previousAvatarPath);
  } finally {
    isRemoving.value = false;
    selectedAvatarFile.value = null;
    clearAvatarPreview();
  }
};

/** Creates an immediate preview and starts avatar persistence after selection. */
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
</script>

<template>
  <div class="space-y-2">
    <UFileUpload
      v-slot="{ open }"
      v-model="selectedAvatarFile"
      accept="image/jpeg,image/png,image/webp"
      :preview="false"
      class="w-full min-h-30"
      variant="area"
      :disabled="isBusy"
      :ui="{
        icon: 'hidden',
        base: 'items-center justify-center text-center border-0 ring-0 shadow-none py-4',
      }"
    >
      <div
        class="flex cursor-pointer flex-col items-center gap-2"
        @click="!isBusy && open()"
      >
        <UAvatar :src="avatarUrl" :alt="avatarAlt" size="xl" class="size-16" />

        <span class="text-sm text-muted">{{ fileDescription }}</span>

        <div class="flex items-center gap-2">
          <UButton label="Edit" color="primary" variant="link" class="p-0" />

          <UButton
            v-if="showRemoveAction"
            label="Remove avatar"
            color="error"
            variant="link"
            class="p-0"
            :disabled="isBusy"
            @click="handleRemoveAvatar"
          />
        </div>
      </div>
    </UFileUpload>
  </div>
</template>
