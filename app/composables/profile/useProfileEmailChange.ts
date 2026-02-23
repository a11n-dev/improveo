import { OTP_RESEND_COOLDOWN_SECONDS } from "~~/shared/constants/auth";

type EmailChangeStep = "form" | "otp";

/**
 * Manages email change request and OTP verification workflow.
 */
export const useProfileEmailChange = () => {
  const { notifyMessage } = useNotify();
  const supabaseClient = useSupabaseClient();
  const supabaseUser = useSupabaseUser();
  const profileStore = useProfileStore();

  const isEmailOverlayOpen = ref(false);
  const isRequesting = ref(false);
  const isVerifying = ref(false);
  const isFinalizingConfirmation = ref(false);
  const pendingEmail = ref("");
  const step = ref<EmailChangeStep>("form");
  const otpValue = ref<number[]>([]);
  const {
    isActive: isResendCooldownActive,
    secondsLeft: resendSeconds,
    start: startResendCooldown,
    stop: stopResendCooldown,
  } = useCodeResend();

  const isBusy = computed(
    () =>
      isRequesting.value || isVerifying.value || isFinalizingConfirmation.value,
  );

  const canRequestEmailChange = computed(
    () => !isBusy.value && !isResendCooldownActive.value,
  );

  const resetFlow = (): void => {
    step.value = "form";
    otpValue.value = [];
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

  const requestEmailChange = async (nextEmail: string): Promise<boolean> => {
    const normalizedEmail = nextEmail.trim().toLowerCase();

    if (!canRequestEmailChange.value) {
      return false;
    }

    isRequesting.value = true;

    try {
      const { error } = await supabaseClient.auth.updateUser({
        email: normalizedEmail,
      });

      if (error) {
        notifyMessage({
          scope: "profile",
          code: "email_update_failed",
          params: { message: error.message },
        });
        return false;
      }

      pendingEmail.value = normalizedEmail;
      step.value = "otp";
      otpValue.value = [];
      startResendCooldown(OTP_RESEND_COOLDOWN_SECONDS);

      return true;
    } finally {
      isRequesting.value = false;
    }
  };

  const handleBack = (): void => {
    if (step.value === "otp") {
      step.value = "form";
      otpValue.value = [];
      return;
    }

    closeOverlay();
  };

  const verifyCode = async (): Promise<boolean> => {
    if (isBusy.value) {
      return false;
    }

    const token = otpValue.value.join("").trim();

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

  watch(isEmailOverlayOpen, (value) => {
    if (!value) {
      resetFlow();
    }
  });

  return {
    canRequestEmailChange,
    handleBack,
    isBusy,
    isEmailOverlayOpen,
    isRequesting,
    isVerifying,
    openOverlay,
    otpValue,
    pendingEmail,
    requestEmailChange,
    resendSeconds,
    step,
    verifyCode,
  };
};
