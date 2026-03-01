<script setup lang="ts">
import { PROFILE_NAME_MAX_LENGTH } from "~~/shared/constants/validation";
import { UsernameSchema } from "~~/shared/validation/auth";

const profileStore = useProfileStore();
const { notifyMessage } = useNotify();
const { profile } = storeToRefs(profileStore);

const draftUsername = ref(profile.value?.username ?? "");
const isFocused = ref(false);
const isSavingUsername = ref(false);

/** Normalizes username draft to lowercase on each input change. */
const username = computed({
  get: () => draftUsername.value,
  set: (value: string) => {
    draftUsername.value = value.toLowerCase();
  },
});

const parsedUsername = computed(() =>
  UsernameSchema.safeParse(draftUsername.value),
);

const normalizedUsername = computed(() => {
  if (!parsedUsername.value.success) {
    return draftUsername.value;
  }

  return parsedUsername.value.data;
});

/** Whether the current username draft differs from persisted profile state. */
const hasUsernameChanged = computed(
  () => normalizedUsername.value !== (profile.value?.username ?? ""),
);

/** Persists edited username through profile store. */
const saveUsername = async (): Promise<boolean> => {
  const result = parsedUsername.value;

  if (
    profile.value === null ||
    isSavingUsername.value ||
    !hasUsernameChanged.value ||
    !result.success
  ) {
    return false;
  }

  isSavingUsername.value = true;

  try {
    const updatedProfile = await profileStore.updateProfile({
      username: result.data,
    });

    if (!updatedProfile) {
      notifyMessage({ scope: "profile", code: "update_failed" });
      return false;
    }

    return true;
  } finally {
    isSavingUsername.value = false;
  }
};

/** Starts inline username editing when the input receives focus. */
const handleUsernameFocus = (): void => {
  if (!profile.value) {
    return;
  }

  isFocused.value = true;
};

/**
 * Reverts unsaved edits when Escape is pressed.
 *
 * Keeps the field focused behavior predictable without requiring extra controls.
 */
const handleUsernameEscape = (): void => {
  draftUsername.value = profile.value?.username ?? "";
  isFocused.value = false;
};

/**
 * Persists a valid changed username when editing ends.
 *
 * Invalid drafts are reverted to keep blur-save behavior predictable.
 */
const handleUsernameBlur = async (): Promise<void> => {
  isFocused.value = false;

  if (!hasUsernameChanged.value || profile.value === null) {
    return;
  }

  if (!parsedUsername.value.success) {
    draftUsername.value = profile.value.username ?? "";
    return;
  }

  await saveUsername();
};

/** Keeps local draft in sync with store updates when not actively editing. */
watch(
  () => profile.value?.username,
  (value) => {
    if (isFocused.value) {
      return;
    }

    draftUsername.value = value ?? "";
  },
  { immediate: true },
);
</script>

<template>
  <ProfileSettingsField variant="content">
    <UInput
      v-model="username"
      class="w-full"
      variant="none"
      :ui="{
        base: 'p-0! text-sm/5 font-medium text-highlighted hover:bg-transparent focus:bg-transparent overflow-visible rounded-none',
      }"
      placeholder="e.g. johndoe"
      :disabled="!profile"
      :maxlength="PROFILE_NAME_MAX_LENGTH"
      @focus="handleUsernameFocus"
      @blur="handleUsernameBlur"
      @keydown.esc.prevent="handleUsernameEscape"
    />
  </ProfileSettingsField>
</template>
