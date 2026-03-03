<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

import type { EmailChangeStep } from "~/types/email";
import { joinOtpDigits } from "~/utils/auth/otp";

import { EmailSchema } from "~~/shared/validation/auth";

interface Props {
  currentEmail: string;
  pendingEmail: string;
  step: EmailChangeStep;
  canRequestEmailChange: boolean;
  resendSeconds: number;
  isRequesting: boolean;
  isVerifying: boolean;
}

const {
  currentEmail,
  pendingEmail,
  step,
  canRequestEmailChange,
  resendSeconds,
  isRequesting,
  isVerifying,
} = defineProps<Props>();

const emit = defineEmits<{
  request: [email: string];
  back: [];
  verify: [token: string];
  "after:leave": [];
}>();

const open = defineModel<boolean>("open", { default: false });
const otpValue = ref<number[]>([]);

const emailChangeFormSchema = z
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

type EmailChangeFormData = z.output<typeof emailChangeFormSchema>;

const formState = reactive<EmailChangeFormData>({
  nextEmail: "",
  confirmEmail: "",
});

type FormInstance = {
  clear: (path?: string | RegExp) => void;
  submit: () => Promise<void>;
};

const form = ref<FormInstance | null>(null);

/** Enables verify action only when a full 6-digit OTP is entered. */
const canVerify = computed(
  () => joinOtpDigits(otpValue.value).length === 6 && !isVerifying,
);

/** Minimal guard to prevent empty request submissions. */
const canSendConfirmation = computed(
  () =>
    canRequestEmailChange &&
    !isRequesting &&
    formState.nextEmail.trim().length > 0 &&
    formState.confirmEmail.trim().length > 0,
);

const otpToken = computed(() => joinOtpDigits(otpValue.value));

const resendCountdown = computed(() => formatCountdown(resendSeconds));

/** Resets local email form state whenever overlay opens. */
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
 * Emits request only when form validation passes.
 */
const handleRequest = (event: FormSubmitEvent<EmailChangeFormData>): void => {
  if (!canRequestEmailChange || isRequesting) {
    return;
  }

  emit("request", event.data.nextEmail);
};

/** Submits the email change form programmatically from footer action. */
const submitRequestForm = async (): Promise<void> => {
  if (!canSendConfirmation.value) {
    return;
  }

  await form.value?.submit();
};

/** Emits OTP verification request when current token is complete. */
const submitVerify = (): void => {
  if (!canVerify.value) {
    return;
  }

  emit("verify", otpToken.value);
};
</script>

<template>
  <CommonOverlay
    v-model:open="open"
    title="Change email"
    :description="
      step === 'form'
        ? 'Update the email linked to your account.'
        : 'Complete verification to apply this email change.'
    "
    :modal-props="{ ui: { footer: 'flex-col gap-2' } }"
    :drawer-props="{ ui: { footer: 'flex-col gap-2' } }"
    @after:leave="emit('after:leave')"
  >
    <template #body>
      <UForm
        v-if="step === 'form'"
        ref="form"
        :state="formState"
        :schema="emailChangeFormSchema"
        :validate-on="[]"
        class="space-y-4"
        @submit="handleRequest"
      >
        <ProfileSettingsAccountViewEmailFormChange
          v-model:state="formState"
          :current-email="currentEmail"
          :disabled="isRequesting"
        />
      </UForm>

      <ProfileSettingsAccountViewEmailFormVerify
        v-else
        v-model:otp-value="otpValue"
        :pending-email="pendingEmail"
        :disabled="isVerifying || isRequesting"
        @complete="submitVerify"
      />
    </template>

    <template #footer>
      <CommonOverlayFooter
        :actions="
          step === 'form'
            ? [
                {
                  label: 'Save',
                  color: 'primary',
                  loading: isRequesting,
                  disabled: !canSendConfirmation,
                  onClick: submitRequestForm,
                },
              ]
            : [
                {
                  label: 'Verify code',
                  color: 'primary',
                  loading: isVerifying,
                  disabled: !canVerify || isRequesting,
                  onClick: submitVerify,
                },
                {
                  label: 'Back',
                  color: 'secondary',
                  disabled: isVerifying,
                  onClick: () => emit('back'),
                },
              ]
        "
      >
        <template #bottom>
          <template v-if="step === 'form'">
            <p v-if="resendSeconds > 0" class="text-center text-sm text-muted">
              You can request another code in {{ resendCountdown }}.
            </p>
          </template>

          <template v-else>
            <CommonCodeResendAction
              :seconds-left="resendSeconds"
              :can-resend="
                Boolean(pendingEmail) &&
                canRequestEmailChange &&
                !isRequesting &&
                !isVerifying
              "
              @resend="emit('request', pendingEmail)"
            />
          </template>
        </template>
      </CommonOverlayFooter>
    </template>
  </CommonOverlay>
</template>
