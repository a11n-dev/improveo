<script setup lang="ts">
import type { AuthMode, AuthStep } from "~/types/auth";
import { formatCountdown } from "~/utils/format";

definePageMeta({
  layout: "auth",
  middleware: "auth",
});

const { clearError, isSending, isVerifying, requestOtp, verifyOtp } = useAuth();

// UI mode and current step
const activeTab = ref<AuthMode>("login");
const step = ref<AuthStep>("request");

// Form state for login/register
const formState = reactive({
  name: "",
  email: "",
});

// OTP input and resend cooldown
const otpValue = ref<string[]>([]);
const resendSeconds = ref(0);

const isRegister = computed(() => activeTab.value === "register");

/** Normalize OTP input array into a single string token. */
const otpToken = computed(() => otpValue.value.join(""));

/** Format countdown as mm:ss for display. */
const resendCountdown = computed(() => formatCountdown(resendSeconds.value));

/** Validate that required fields are filled before sending OTP. */
const canSend = computed(() => {
  const hasEmail = formState.email.trim().length > 0;
  const hasName = !isRegister.value || formState.name.trim().length > 0;

  return hasEmail && hasName;
});

/** Validate that email and full OTP are present before verification. */
const canVerify = computed(() => {
  return formState.email.trim().length > 0 && otpToken.value.length === 6;
});

const stopResendCountdown = () => {
  resendSeconds.value = 0;
};

const startResendCountdown = (seconds = 60) => {
  resendSeconds.value = seconds;
};

// Countdown tick: decrement every second when active
watch(resendSeconds, (value, _, onCleanup) => {
  if (value <= 0) {
    return;
  }

  const timeout = setTimeout(() => {
    resendSeconds.value = value - 1;
  }, 1000);

  onCleanup(() => {
    clearTimeout(timeout);
  });
});

/** Reset form state when switching between login and register modes. */
watch(activeTab, () => {
  step.value = "request";
  otpValue.value = [];
  stopResendCountdown();
  clearError();
});

/** Request or resend OTP depending on current step. */
const handleOtpRequest = async () => {
  if (isSending.value) {
    return;
  }

  if (step.value === "request" && !canSend.value) {
    return;
  }

  if (step.value === "verify" && resendSeconds.value > 0) {
    return;
  }

  const success = await requestOtp({
    email: formState.email,
    name: isRegister.value ? formState.name : undefined,
    shouldCreateUser: isRegister.value,
  });

  if (!success) {
    return;
  }

  otpValue.value = [];

  if (step.value === "request") {
    step.value = "verify";
    stopResendCountdown();
    return;
  }

  startResendCountdown();
};

/** Verify OTP and redirect to home on success. */
const handleVerify = async () => {
  if (!canVerify.value || isVerifying.value) {
    return;
  }

  const success = await verifyOtp({
    email: formState.email,
    token: otpToken.value,
  });

  if (success) {
    stopResendCountdown();
    await navigateTo("/");
  }
};

/** Return to email entry step from OTP verification. */
const handleBack = () => {
  step.value = "request";
  otpValue.value = [];
  stopResendCountdown();
  clearError();
};

/** Form submit handler: routes to appropriate action based on current step. */
const handleSubmit = async () => {
  if (step.value === "request") {
    await handleOtpRequest();
    return;
  }

  await handleVerify();
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
  <div class="flex min-h-screen items-center justify-center p-6">
    <div class="flex w-full max-w-sm flex-col gap-3">
      <UCard>
        <template #header>
          <div class="relative flex items-center justify-center">
            <UButton
              v-if="step === 'verify'"
              variant="ghost"
              color="neutral"
              icon="i-lucide-arrow-left"
              aria-label="Back"
              class="absolute left-0 top-1/2 -translate-y-1/2"
              @click="handleBack"
            />
            <span class="text-lg font-semibold text-highlighted"
              >Improveme</span
            >
          </div>
        </template>

        <UForm
          :state="formState"
          class="flex flex-col gap-4"
          @submit="handleSubmit"
        >
          <USeparator class="mx-auto w-10" size="lg" />
          <div v-if="step === 'request'" class="flex flex-col gap-4">
            <p class="text-sm text-muted">
              {{
                isRegister
                  ? "Create an account to get started."
                  : "Sign in to continue."
              }}
            </p>
            <UFormField
              v-if="isRegister"
              label="Display Name"
              name="name"
              required
            >
              <UInput
                v-model="formState.name"
                class="w-full"
                placeholder="Your name"
                autocomplete="name"
              />
            </UFormField>

            <UFormField label="Email Address" name="email" required>
              <UInput
                v-model="formState.email"
                class="w-full"
                type="email"
                placeholder="example@example.com"
                autocomplete="email"
              />
            </UFormField>

            <UButton
              type="submit"
              :loading="isSending"
              :disabled="!canSend"
              :label="isRegister ? 'Sign Up' : 'Sign In'"
              block
            />
          </div>

          <div v-else class="flex flex-col gap-4">
            <div class="text-sm text-muted">
              <p>Enter the 6-character code sent to:</p>
              <p class="font-medium text-highlighted">
                {{ formState.email }}
              </p>
            </div>

            <UPinInput
              v-model="otpValue"
              :length="6"
              otp
              size="lg"
              placeholder="·"
              autofocus
              class="self-center"
            />

            <div class="space-y-3">
              <UButton
                type="submit"
                block
                :loading="isVerifying"
                :disabled="!canVerify"
                label="Verify & Continue"
              />
              <p class="text-center text-sm text-muted">
                Didn't receive a code?
                <UButton
                  type="button"
                  variant="link"
                  class="px-1 text-primary"
                  :disabled="resendSeconds > 0 || isSending"
                  @click="handleOtpRequest"
                >
                  Resend code
                </UButton>
                <span v-if="resendSeconds > 0">in {{ resendCountdown }}</span>
              </p>
            </div>
          </div>
        </UForm>
      </UCard>

      <p class="text-center text-sm text-muted">
        <template v-if="isRegister">
          Already have an account?
          <UButton
            type="button"
            variant="link"
            class="px-1 text-primary"
            @click="toggleAuthMode"
          >
            Login Here
          </UButton>
        </template>

        <template v-else>
          Don't have an account?
          <UButton
            type="button"
            variant="link"
            class="px-1 text-primary"
            @click="toggleAuthMode"
          >
            Request Now
          </UButton>
        </template>
      </p>
    </div>
  </div>
</template>
