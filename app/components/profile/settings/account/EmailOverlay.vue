<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

import { EmailSchema } from "~~/shared/validation/auth";

const {
  currentEmail,
  pendingEmail,
  step,
  canRequestEmailChange,
  resendSeconds,
  isRequesting,
  isVerifying,
} = defineProps<{
  currentEmail: string;
  pendingEmail: string;
  step: "form" | "otp";
  canRequestEmailChange: boolean;
  resendSeconds: number;
  isRequesting: boolean;
  isVerifying: boolean;
}>();

const emit = defineEmits<{
  (e: "request", email: string): void;
  (e: "back" | "verify"): void;
}>();
const open = defineModel<boolean>("open", { default: false });
const otpValue = defineModel<string[]>("otpValue", { default: () => [] });

const EmailChangeFormSchema = z
  .object({
    nextEmail: EmailSchema,
    confirmEmail: EmailSchema,
  })
  .superRefine((value, context) => {
    if (value.nextEmail.toLowerCase() === currentEmail.toLowerCase()) {
      context.addIssue({
        code: "custom",
        path: ["nextEmail"],
        message: "Enter a different email address",
      });
    }

    if (value.confirmEmail.toLowerCase() !== value.nextEmail.toLowerCase()) {
      context.addIssue({
        code: "custom",
        path: ["confirmEmail"],
        message: "Email addresses do not match",
      });
    }
  });

type EmailChangeFormData = z.output<typeof EmailChangeFormSchema>;

const formState = reactive<EmailChangeFormData>({
  nextEmail: "",
  confirmEmail: "",
});

type FormInstance = {
  clear: (path?: string | RegExp) => void;
  submit: () => Promise<void>;
};

const form = ref<FormInstance | null>(null);

/**
 * Enables verify action only when a full 6-digit OTP is entered.
 */
const canVerify = computed(
  () => otpValue.value.join("").trim().length === 6 && !isVerifying,
);

/**
 * Minimal client-side guard to prevent empty confirmation submits.
 */
const hasEmailInput = computed(
  () =>
    formState.nextEmail.trim().length > 0 &&
    formState.confirmEmail.trim().length > 0,
);

const canSendConfirmation = computed(
  () => hasEmailInput.value && canRequestEmailChange && !isRequesting,
);

const resendCountdown = computed(() => formatCountdown(resendSeconds));

/**
 * Resets local form state whenever overlay re-opens.
 */
watch(open, (value) => {
  if (!value) {
    return;
  }

  formState.nextEmail = "";
  formState.confirmEmail = "";
  otpValue.value = [];
  form.value?.clear();
});

/**
 * Emits request only when local guard allows submit from current form state.
 */
const handleRequest = (event: FormSubmitEvent<EmailChangeFormData>): void => {
  if (!canSendConfirmation.value) {
    return;
  }

  emit("request", event.data.nextEmail);
};

/**
 * Submits Nuxt UI form programmatically from footer button.
 */
const submitRequestForm = async (): Promise<void> => {
  await form.value?.submit();
};
</script>

<template>
  <ResponsiveOverlay
    v-model:open="open"
    title="Change email"
    :description="
      step === 'form'
        ? 'Update the email linked to your account.'
        : 'Complete verification to apply this email change.'
    "
    :modal-props="{ ui: { footer: 'flex-col gap-2' } }"
    :drawer-props="{ ui: { footer: 'flex-col gap-2' } }"
  >
    <template #body>
      <UForm
        v-if="step === 'form'"
        ref="form"
        :state="formState"
        :schema="EmailChangeFormSchema"
        :validate-on="[]"
        class="space-y-3"
        @submit="handleRequest"
      >
        <UFormField
          label="New email"
          name="nextEmail"
          :hint="`Current: ${currentEmail}`"
          help="Enter the new email address you want to use."
          required
        >
          <UInput
            v-model="formState.nextEmail"
            class="w-full"
            type="email"
            :disabled="isRequesting"
          />
        </UFormField>

        <UFormField
          label="Confirm new email"
          name="confirmEmail"
          help="Repeat the same email to avoid typos."
          required
        >
          <UInput
            v-model="formState.confirmEmail"
            class="w-full"
            type="email"
            :disabled="isRequesting"
          />
        </UFormField>
      </UForm>

      <div v-else class="space-y-3">
        <p class="text-sm text-muted">
          Enter the 6-digit code sent to
          <span class="font-medium text-highlighted">{{ pendingEmail }}</span>
        </p>

        <UPinInput
          v-model="otpValue"
          :length="6"
          otp
          size="xl"
          placeholder="·"
          class="w-full justify-between"
          :disabled="isVerifying"
          @complete="emit('verify')"
        />
      </div>
    </template>

    <template #footer>
      <template v-if="step === 'form'">
        <UButton
          label="Send confirmation"
          color="neutral"
          block
          :loading="isRequesting"
          :disabled="!canSendConfirmation"
          @click="submitRequestForm"
        />

        <UButton
          label="Back"
          color="neutral"
          variant="subtle"
          block
          :disabled="isRequesting"
          @click="emit('back')"
        />

        <p v-if="resendSeconds > 0" class="text-center text-sm text-muted">
          You can request another code in {{ resendCountdown }}.
        </p>
      </template>

      <template v-else>
        <UButton
          label="Verify code"
          color="neutral"
          block
          :loading="isVerifying"
          :disabled="!canVerify || isRequesting"
          @click="emit('verify')"
        />

        <UButton
          label="Back"
          color="neutral"
          variant="subtle"
          block
          :disabled="isVerifying"
          @click="emit('back')"
        />

        <p class="text-center text-sm text-muted">
          Didn&apos;t receive a code?
          <UButton
            v-if="resendSeconds === 0"
            type="button"
            variant="link"
            class="px-1 text-primary"
            :disabled="
              !pendingEmail ||
              !canRequestEmailChange ||
              isRequesting ||
              isVerifying
            "
            @click="emit('request', pendingEmail)"
          >
            Request another code
          </UButton>
          <span v-else>Request another code in {{ resendCountdown }}</span>
        </p>
      </template>
    </template>
  </ResponsiveOverlay>
</template>
