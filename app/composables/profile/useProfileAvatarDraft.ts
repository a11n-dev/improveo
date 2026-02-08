/**
 * Handles avatar draft state, preview lifecycle, and display metadata.
 */
export const useProfileAvatarDraft = (
  profile: Ref<Profile>,
  normalizedName: Ref<string>,
) => {
  const supabaseClient = useSupabaseClient();

  const selectedAvatarFile = ref<File | null>(null);
  const avatarPreviewUrl = ref<string | null>(null);
  const removeCurrentAvatar = ref(false);

  const hasStoredAvatar = computed(() => Boolean(profile.value.avatarPath));

  const currentAvatarUrl = computed(() => {
    return getAvatarPublicUrl(
      supabaseClient,
      removeCurrentAvatar.value ? null : profile.value.avatarPath,
    );
  });

  const avatarUrl = computed(
    () => avatarPreviewUrl.value ?? currentAvatarUrl.value,
  );

  const avatarAlt = computed(() => normalizedName.value || "User");

  const resetAvatarDraft = (): void => {
    selectedAvatarFile.value = null;
    removeCurrentAvatar.value = false;
  };

  const markAvatarForRemoval = (): void => {
    selectedAvatarFile.value = null;
    removeCurrentAvatar.value = true;
  };

  watch(
    selectedAvatarFile,
    (file) => {
      if (avatarPreviewUrl.value) {
        URL.revokeObjectURL(avatarPreviewUrl.value);
        avatarPreviewUrl.value = null;
      }

      if (!file) {
        return;
      }

      avatarPreviewUrl.value = URL.createObjectURL(file);
      removeCurrentAvatar.value = false;
    },
    { flush: "post" },
  );

  onBeforeUnmount(() => {
    if (avatarPreviewUrl.value) {
      URL.revokeObjectURL(avatarPreviewUrl.value);
    }
  });

  return {
    avatarAlt,
    avatarUrl,
    hasStoredAvatar,
    markAvatarForRemoval,
    removeCurrentAvatar,
    resetAvatarDraft,
    selectedAvatarFile,
  };
};
