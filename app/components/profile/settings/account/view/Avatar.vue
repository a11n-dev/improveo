<script setup lang="ts">
const profileStore = useProfileStore();
const supabaseClient = useSupabaseClient();
const { profile } = storeToRefs(profileStore);

const {
  avatarPreviewUrl,
  handleRemoveAvatar,
  isRemoving,
  isUploading,
  selectedAvatarFile,
} = useAvatarUpload();

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
/** Clears persisted avatar immediately and removes storage object best-effort. */
const onRemoveAvatar = async (event: MouseEvent): Promise<void> => {
  event.preventDefault();
  event.stopPropagation();

  if (!isBusy.value) {
    await handleRemoveAvatar();
  }
};
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
            @click="onRemoveAvatar"
          />
        </div>
      </div>
    </UFileUpload>
  </div>
</template>
