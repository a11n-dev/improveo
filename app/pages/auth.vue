<script setup lang="ts">
import type { AuthMode, AuthStep } from "~/types/auth";

interface RequestPayload {
  email: string;
  username?: string;
}

definePageMeta({
  layout: "auth",
});

const supabaseClient = useSupabaseClient();
const { notifyMessage } = useNotify();

const {
  isActive: isResendCooldownActive,
  secondsLeft: resendSeconds,
  start: startResendCountdown,
  stop: stopResendCountdown,
} = useCodeResend();

const mode = ref<AuthMode>("login");
const step = ref<AuthStep>("request");

const state = reactive({
  username: "",
  email: "",
});

const otpValue = ref<number[]>([]);

const isSending = ref(false);
const isVerifying = ref(false);

const isRegister = computed(() => mode.value === "register");

/** Whether user is allowed to request a new OTP code. */
const canResend = computed(
  () => !isResendCooldownActive.value && !isSending.value && !isVerifying.value,
);

const handleRequest = async (payload?: RequestPayload): Promise<void> => {
  if (isResendCooldownActive.value) {
    notifyMessage({
      scope: "supabase",
      code: "resend_cooldown",
      params: {
        seconds: resendSeconds.value,
      },
    });

    return;
  }

  if (payload) {
    state.email = payload.email;

    if (isRegister.value) {
      state.username = payload.username ?? "";
    }
  }

  isSending.value = true;
  const { error } = await supabaseClient.auth.signInWithOtp({
    email: state.email,
    options: {
      shouldCreateUser: isRegister.value,
      ...(isRegister.value && state.username
        ? { data: { username: state.username } }
        : {}),
    },
  });
  isSending.value = false;

  if (error) {
    if (typeof error.code === "string") {
      notifyMessage({ scope: "supabase", code: error.code });
    }

    return;
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
    if (typeof error.code === "string") {
      notifyMessage({ scope: "supabase", code: error.code });
    }

    return;
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
  state.username = "";
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
      :can-resend="canResend"
      @resend="handleRequest"
      @toggle-mode="handleToggleMode"
    />
  </UContainer>
</template>
