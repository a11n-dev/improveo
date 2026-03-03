<script setup lang="ts">
import { joinOtpDigits } from "~/utils/auth/otp";

interface Props {
  email: string;
  isSending?: boolean;
  isVerifying?: boolean;
}

const { email, isSending = false, isVerifying = false } = defineProps<Props>();

const otpValue = defineModel<number[]>("otpValue", { default: () => [] });

const emit = defineEmits<{
  back: [];
  verify: [];
}>();

const otpToken = computed(() => joinOtpDigits(otpValue.value));

/** Enables verify action only when email exists and 6 digits are entered. */
const canVerify = computed(
  () => email.trim().length > 0 && /^\d{6}$/.test(otpToken.value),
);
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="text-sm text-muted">
      <p>Enter the 6-digit code sent to:</p>
      <p class="font-medium text-highlighted">
        {{ email }}
      </p>
    </div>

    <UPinInput
      v-model="otpValue"
      :length="6"
      otp
      size="xl"
      placeholder="·"
      autofocus
      class="justify-between"
      type="number"
      @complete="emit('verify')"
    />

    <div class="flex flex-col gap-2">
      <UButton
        type="button"
        block
        :loading="isVerifying"
        :disabled="!canVerify || isSending"
        label="Verify and continue"
        variant="solid"
        @click="emit('verify')"
      />

      <UButton
        type="button"
        color="neutral"
        variant="soft"
        block
        label="Back"
        :disabled="isVerifying"
        @click="emit('back')"
      />
    </div>
  </div>
</template>
