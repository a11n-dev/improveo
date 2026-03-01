<script setup lang="ts">
type EmailChangeStep = "form" | "otp";

const profileStore = useProfileStore();
const { notifyMessage } = useNotify();
const supabaseClient = useSupabaseClient();
const supabaseUser = useSupabaseUser();
const { profile } = storeToRefs(profileStore);

const isEmailOverlayOpen = ref(false);
const isFinalizingConfirmation = ref(false);
const isRequesting = ref(false);
const isVerifying = ref(false);
const pendingEmail = ref("");
const step = ref<EmailChangeStep>("form");

const {
  isActive: isResendCooldownActive,
  secondsLeft: resendSeconds,
  start: startResendCooldown,
  stop: stopResendCooldown,
} = useCodeResend();

const currentEmail = computed(
  () => supabaseUser.value?.email ?? profile.value?.email ?? "",
);

const isBusy = computed(
  () =>
    isRequesting.value || isVerifying.value || isFinalizingConfirmation.value,
);

const canRequestEmailChange = computed(
  () =>
    !isBusy.value &&
    !isResendCooldownActive.value &&
    currentEmail.value.trim().length > 0,
);

/** Resets the email change flow back to its default step and state. */
const resetFlow = (): void => {
  step.value = "form";
  pendingEmail.value = "";
  isFinalizingConfirmation.value = false;
  isRequesting.value = false;
  isVerifying.value = false;
};

const closeOverlay = (): void => {
  isEmailOverlayOpen.value = false;
  resetFlow();
};

const openOverlay = (): void => {
  resetFlow();
  isEmailOverlayOpen.value = true;
};

/** Finalizes UI state after successful email confirmation. */
const handleConfirmedEmail = async (): Promise<void> => {
  if (isFinalizingConfirmation.value) {
    return;
  }

  isFinalizingConfirmation.value = true;

  try {
    notifyMessage({ scope: "profile", code: "email_updated" });
    stopResendCooldown();
    closeOverlay();
    await profileStore.fetchProfile();
  } finally {
    isFinalizingConfirmation.value = false;
  }
};

/**
 * Handles email change request and starts OTP verification step.
 *
 * Supabase validates email format and eligibility server-side.
 */
const requestEmailChange = async (nextEmail: string): Promise<boolean> => {
  if (!canRequestEmailChange.value) {
    return false;
  }

  isRequesting.value = true;

  try {
    const { error } = await supabaseClient.auth.updateUser({
      email: nextEmail,
    });

    if (error) {
      notifyMessage({
        scope: "profile",
        code: "email_update_failed",
        params: { message: error.message },
      });
      return false;
    }

    pendingEmail.value = nextEmail;
    step.value = "otp";
    startResendCooldown();

    return true;
  } finally {
    isRequesting.value = false;
  }
};

const handleBack = (): void => {
  if (step.value === "otp") {
    step.value = "form";
    return;
  }

  closeOverlay();
};

/** Verifies OTP code and applies email change on success. */
const verifyCode = async (token: string): Promise<boolean> => {
  if (isBusy.value) {
    return false;
  }

  if (token.length !== 6) {
    notifyMessage({ scope: "profile", code: "invalid_code" });
    return false;
  }

  if (!pendingEmail.value) {
    notifyMessage({ scope: "profile", code: "missing_email" });
    closeOverlay();
    return false;
  }

  isVerifying.value = true;

  try {
    const { error } = await supabaseClient.auth.verifyOtp({
      email: pendingEmail.value,
      token,
      type: "email_change",
    });

    if (error) {
      notifyMessage({
        scope: "profile",
        code: "verification_failed",
        params: { message: error.message },
      });
      return false;
    }

    await handleConfirmedEmail();
    return true;
  } finally {
    isVerifying.value = false;
  }
};

/** Keeps UI in sync when Supabase session email updates asynchronously. */
watch(
  () => supabaseUser.value?.email?.toLowerCase(),
  (email) => {
    if (!email || !pendingEmail.value) {
      return;
    }

    if (email === pendingEmail.value.toLowerCase()) {
      void handleConfirmedEmail();
    }
  },
);

watch(isEmailOverlayOpen, (value) => {
  if (!value) {
    resetFlow();
  }
});
</script>

<template>
  <ProfileSettingsAccountViewEmailField
    :email="currentEmail"
    :disabled="!profile || isBusy"
    @open="openOverlay"
  />

  <ProfileSettingsAccountViewEmailOverlay
    v-model:open="isEmailOverlayOpen"
    :current-email="currentEmail"
    :pending-email="pendingEmail"
    :step="step"
    :can-request-email-change="canRequestEmailChange"
    :resend-seconds="resendSeconds"
    :is-requesting="isRequesting"
    :is-verifying="isVerifying"
    @request="requestEmailChange"
    @back="handleBack"
    @verify="verifyCode"
  />
</template>
