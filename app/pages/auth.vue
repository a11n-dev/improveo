<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";

import type { AuthMode, AuthStep } from "~/types/auth";

import { AuthLoginSchema, AuthRegisterSchema } from "~~/shared/validation/auth";
import type {
  AuthLoginInput,
  AuthRegisterInput,
} from "~~/shared/validation/auth";

definePageMeta({
  layout: "auth",
});

const supabaseClient = useSupabaseClient();
const { notifyError } = useToastNotify();

const isSending = ref(false);
const isVerifying = ref(false);

// UI mode and current step
const activeTab = ref<AuthMode>("login");
const step = ref<AuthStep>("request");

// Form state for login/register
const formState = reactive({
  name: "",
  email: "",
});

// OTP input and resend cooldown
const otpValue = ref<number[]>([]);
const {
  isActive: isResendCooldownActive,
  secondsLeft: resendSeconds,
  start: startResendCountdown,
  stop: stopResendCountdown,
} = useResendCooldown();

const isRegister = computed(() => activeTab.value === "register");
const authSchema = computed(() =>
  isRegister.value ? AuthRegisterSchema : AuthLoginSchema,
);

/** Normalize OTP input array into a single string token. */
const otpToken = computed(() => otpValue.value.join(""));

const hasValidOtp = () =>
  formState.email.trim().length > 0 && otpToken.value.length === 6;

const canRequestOtp = computed(
  () => !isSending.value && !isVerifying.value && !isResendCooldownActive.value,
);

/** Reset form state when switching between login and register modes. */
watch(activeTab, () => {
  step.value = "request";
  otpValue.value = [];
  stopResendCountdown();
  formState.name = "";
  formState.email = "";
});

const notifyRequestError = (message: string): void => {
  if (/signups not allowed/i.test(message)) {
    notifyError(
      "Account not found",
      "No account found. Please register first.",
    );
    return;
  }

  notifyError("Unable to send code", message);
};

const notifyOtpError = (message: string): void => {
  if (/expired/i.test(message)) {
    notifyError("Code expired", "Request a new code and try again.");
    return;
  }

  if (/invalid|token/i.test(message)) {
    notifyError("Invalid code", "Double-check the code or request a new one.");
    return;
  }

  notifyError("Verification failed", message);
};

const requestOtp = async (payload: AuthFormOutput): Promise<boolean> => {
  isSending.value = true;

  const { error: supabaseError } = await supabaseClient.auth.signInWithOtp({
    email: payload.email,
    options: {
      shouldCreateUser: isRegister.value,
      ...(isRegister.value && payload.name
        ? { data: { name: payload.name } }
        : {}),
    },
  });

  isSending.value = false;

  if (supabaseError) {
    notifyRequestError(supabaseError.message);
    return false;
  }

  return true;
};

/** Request or resend OTP depending on current step. */
type AuthFormOutput = AuthLoginInput | AuthRegisterInput;

const handleOtpRequest = async (data?: AuthFormOutput) => {
  if (!canRequestOtp.value) {
    return;
  }

  const payload = data ?? formState;
  const success = await requestOtp(payload);

  if (!success) {
    return;
  }

  otpValue.value = [];

  if (step.value === "request") {
    step.value = "verify";
    startResendCountdown();
    return;
  }

  startResendCountdown();
};

/** Verify OTP and redirect to home on success. */
const handleVerify = async () => {
  if (!hasValidOtp() || isVerifying.value) {
    return;
  }

  const normalizedToken = otpToken.value.replace(/\s/g, "");

  if (normalizedToken.length !== 6) {
    notifyError("Invalid code", "Enter the 6-digit code.");
    return;
  }

  isVerifying.value = true;

  const { error: supabaseError } = await supabaseClient.auth.verifyOtp({
    email: formState.email.trim(),
    token: normalizedToken,
    type: "email",
  });

  isVerifying.value = false;

  if (supabaseError) {
    notifyOtpError(supabaseError.message);
    return;
  }

  stopResendCountdown();
  await navigateTo("/");
};

/** Return to email entry step from OTP verification. */
const handleBack = () => {
  step.value = "request";
  otpValue.value = [];
};

/** Form submit handler: routes to appropriate action based on current step. */
const handleSubmit = async (event: FormSubmitEvent<AuthFormOutput>) => {
  await handleOtpRequest(event.data);
};

/** Toggle between login and register modes. */
const toggleAuthMode = () => {
  activeTab.value = activeTab.value === "login" ? "register" : "login";
};

onBeforeUnmount(() => {
  stopResendCountdown();
});
</script>

<template>
  <UContainer class="flex w-full max-w-md flex-col gap-3 text-left">
    <div class="flex flex-col gap-3">
      <UColorModeImage
        light="/logo-light.svg"
        dark="/logo-dark.svg"
        alt="Improveo Logo"
        class="h-11 w-11"
      />
      <span class="text-lg text-highlighted">
        {{ isRegister ? "Sign up to Improveo" : "Log in to Improveo" }}
      </span>
    </div>

    <AuthRequestForm
      v-if="step === 'request'"
      v-model:state="formState"
      :schema="authSchema"
      :is-register="isRegister"
      :is-sending="isSending"
      :can-submit="canRequestOtp"
      :resend-seconds="resendSeconds"
      @submit="handleSubmit"
    />
    <AuthVerifyForm
      v-else
      v-model:otp-value="otpValue"
      :email="formState.email"
      :resend-seconds="resendSeconds"
      :is-sending="isSending"
      :is-verifying="isVerifying"
      @verify="handleVerify"
      @back="handleBack"
      @request="handleOtpRequest()"
    />

    <p v-if="step === 'request'" class="text-sm text-muted">
      <template v-if="isRegister">
        <span>Already have an account?</span>
        <UButton
          type="button"
          variant="link"
          class="ml-1 px-0 py-0 text-primary"
          @click="toggleAuthMode"
        >
          Log in
        </UButton>
      </template>

      <template v-else>
        <span>Don’t have an account?</span>
        <UButton
          type="button"
          variant="link"
          class="ml-1 px-0 py-0 text-primary"
          @click="toggleAuthMode"
        >
          Create one
        </UButton>
      </template>
    </p>
  </UContainer>
</template>
