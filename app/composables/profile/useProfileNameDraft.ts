import type { Ref } from "vue";

import {
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NAME_MIN_LENGTH,
} from "~~/shared/constants/validation";

/**
 * Handles profile name draft state and validation rules.
 */
export const useProfileNameDraft = (profile: Ref<Profile>) => {
  const draftName = ref("");

  const normalizedName = computed(() => draftName.value.trim());

  const hasNameChange = computed(
    () => normalizedName.value !== (profile.value.name ?? ""),
  );

  const nameError = computed(() => {
    if (!hasNameChange.value) {
      return "";
    }

    if (normalizedName.value.length < PROFILE_NAME_MIN_LENGTH) {
      return `Name must be at least ${PROFILE_NAME_MIN_LENGTH} characters`;
    }

    if (normalizedName.value.length > PROFILE_NAME_MAX_LENGTH) {
      return `Name must be ${PROFILE_NAME_MAX_LENGTH} characters or less`;
    }

    return "";
  });

  const resetNameDraft = (): void => {
    draftName.value = profile.value.name ?? "";
  };

  return {
    draftName,
    hasNameChange,
    nameError,
    normalizedName,
    resetNameDraft,
  };
};
