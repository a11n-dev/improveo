import type { Ref } from "vue";

import { useDebounceFn } from "@vueuse/core";

import { USERNAME_CHECK_DEBOUNCE_MS } from "~~/shared/constants/validation";
import { UsernameSchema } from "~~/shared/validation/auth";

/**
 * Debounced username availability checker.
 */
export const useUsernameCheck = (
  draftUsername: Ref<string>,
  currentUsername?: Ref<string | undefined>,
) => {
  const isChecking = ref(false);
  const isAvailable = ref<boolean | null>(null);
  const availabilityError = ref<string | null>(null);

  const resolvedCurrentUsername = currentUsername ?? ref<string | undefined>();

  let activeRequestToken = 0;

  const resetState = (): void => {
    isChecking.value = false;
    isAvailable.value = null;
    availabilityError.value = null;
  };

  const checkAvailability = async (
    normalizedUsername: string,
    requestToken: number,
  ): Promise<void> => {
    if (requestToken !== activeRequestToken) {
      return;
    }

    isChecking.value = true;

    try {
      const response = await $fetch<{ available: boolean }>(
        "/api/profile/availability",
        {
          query: {
            username: normalizedUsername,
          },
        },
      );

      if (requestToken !== activeRequestToken) {
        return;
      }

      isAvailable.value = response.available;
      availabilityError.value = response.available
        ? null
        : "Username is already taken";
    } catch {
      if (requestToken !== activeRequestToken) {
        return;
      }

      isAvailable.value = null;
      availabilityError.value = null;
    } finally {
      if (requestToken === activeRequestToken) {
        isChecking.value = false;
      }
    }
  };

  const debouncedCheck = useDebounceFn(
    (normalizedUsername: string, requestToken: number): void => {
      void checkAvailability(normalizedUsername, requestToken);
    },
    USERNAME_CHECK_DEBOUNCE_MS,
  );

  watch(
    [draftUsername, resolvedCurrentUsername],
    ([nextDraftUsername, nextCurrentUsername]) => {
      activeRequestToken += 1;
      const requestToken = activeRequestToken;

      resetState();

      const parsedDraft = UsernameSchema.safeParse(nextDraftUsername);

      if (!parsedDraft.success) {
        return;
      }

      const normalizedCurrentUsername =
        typeof nextCurrentUsername === "string"
          ? nextCurrentUsername.trim().toLowerCase()
          : "";

      if (
        normalizedCurrentUsername.length > 0 &&
        parsedDraft.data === normalizedCurrentUsername
      ) {
        isAvailable.value = true;
        return;
      }

      isChecking.value = true;
      debouncedCheck(parsedDraft.data, requestToken);
    },
    { flush: "post" },
  );

  onBeforeUnmount(() => {
    activeRequestToken += 1;
  });

  return {
    availabilityError,
    isAvailable,
    isChecking,
  };
};
