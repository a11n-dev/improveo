<script setup lang="ts">
import type { AuthMode, AuthStep } from "~/types/auth";

interface RequestPayload {
  email: string;
  name?: string;
}

definePageMeta({
  layout: "auth",
});

const supabaseClient = useSupabaseClient();
const { notifyError, notifyWarning } = useToastNotify();

const {
  isActive: isResendCooldownActive,
  secondsLeft: resendSeconds,
  start: startResendCountdown,
  stop: stopResendCountdown,
} = useResendCooldown();

const mode = ref<AuthMode>("login");
const step = ref<AuthStep>("request");

const state = reactive({
  name: "",
  email: "",
});

const otpValue = ref<number[]>([]);

const isSending = ref(false);
const isVerifying = ref(false);

const isRegister = computed(() => mode.value === "register");

/** Whether user is allowed to request a new OTP code. */
const canRequestCode = computed(
  () => !isResendCooldownActive.value && !isSending.value && !isVerifying.value,
);

const handleRequest = async (payload?: RequestPayload): Promise<void> => {
  if (!canRequestCode.value) {
    notifyWarning(
      "Please wait",
      `You can request a new code in ${resendSeconds.value} seconds.`,
    );
    return;
  }

  if (payload) {
    state.email = payload.email;

    if (isRegister.value) {
      state.name = payload.name ?? "";
    }
  }

  isSending.value = true;
  const { error } = await supabaseClient.auth.signInWithOtp({
    email: state.email,
    options: {
      shouldCreateUser: isRegister.value,
      ...(isRegister.value && state.name ? { data: { name: state.name } } : {}),
    },
  });
  isSending.value = false;

  if (error) {
    switch (error.code) {
      case "signup_disabled": {
        if (isRegister.value) {
          notifyError("Sign up is disabled", "Please try again later.");
          return;
        }

        notifyError(
          "Account not found",
          "No account found. Please register first.",
        );
        return;
      }
      case "over_email_send_rate_limit":
      case "over_request_rate_limit":
        notifyWarning(
          "Too many requests",
          "Please wait before requesting again.",
        );
        return;
      case "otp_disabled": {
        if (!isRegister.value) {
          notifyError(
            "Account not found",
            "No account found. Please register first.",
          );
          return;
        }

        notifyError(
          "OTP is disabled",
          "Email verification is currently unavailable.",
        );
        return;
      }
      default:
        notifyError("Unable to send code", error.message);
        return;
    }
  }

  if (step.value === "verify") {
    otpValue.value = [];
    startResendCountdown();
    return;
  }

  step.value = "verify";
  otpValue.value = [];
  startResendCountdown();
};

const handleVerify = async (): Promise<void> => {
  if (isVerifying.value) {
    return;
  }

  isVerifying.value = true;
  const { error } = await supabaseClient.auth.verifyOtp({
    email: state.email,
    token: otpValue.value.join(""),
    type: "email",
  });
  isVerifying.value = false;

  if (error) {
    switch (error.code) {
      case "otp_expired":
      case "invalid_credentials":
        notifyError(
          "Invalid or expired code",
          "Double-check the code or request a new one.",
        );
        return;
      default:
        notifyError("Verification failed", error.message);
        return;
    }
  }

  stopResendCountdown();
  await navigateTo("/");
};

/** Returns from verify step back to login/register request step. */
const handleBack = (): void => {
  step.value = "request";
  otpValue.value = [];
};

/** Toggles auth mode and fully resets transient auth UI state. */
const handleToggleMode = (): void => {
  mode.value = mode.value === "login" ? "register" : "login";
  step.value = "request";
  state.name = "";
  state.email = "";
  otpValue.value = [];
  stopResendCountdown();
};
</script>

<template>
  <UContainer class="flex w-full max-w-md flex-col text-left">
    <AuthHeader :mode="mode" :step="step" />

    <AuthForm
      v-model:state="state"
      v-model:otp-value="otpValue"
      :mode="mode"
      :step="step"
      :is-sending="isSending"
      :is-verifying="isVerifying"
      @request="handleRequest"
      @verify="handleVerify"
      @back="handleBack"
    />

    <AuthFooter
      :mode="mode"
      :step="step"
      :resend-seconds="resendSeconds"
      :can-request-code="canRequestCode"
      @request="handleRequest"
      @toggle-mode="handleToggleMode"
    />
  </UContainer>
</template>
