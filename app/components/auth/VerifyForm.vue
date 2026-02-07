<script setup lang="ts">
interface Props {
  email: string;
  resendSeconds: number;
  isSending: boolean;
  isVerifying: boolean;
}

const props = defineProps<Props>();

const otpValue = defineModel<string[]>("otpValue", { default: () => [] });

const emit = defineEmits<{
  verify: [];
  back: [];
  resend: [];
}>();

const resendCountdown = computed(() => formatCountdown(props.resendSeconds));
const canVerify = computed(
  () => props.email.trim().length > 0 && otpValue.value.length === 6,
);
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="text-sm text-muted">
      <p>Enter the 6-digit code sent to:</p>
      <p class="font-medium text-highlighted">
        {{ props.email }}
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
      @complete="emit('verify')"
    />

    <div class="flex flex-col gap-3">
      <UButton
        type="button"
        block
        :loading="props.isVerifying"
        :disabled="!canVerify"
        label="Verify and continue"
        @click="emit('verify')"
      />
      <UButton
        type="button"
        color="neutral"
        variant="soft"
        block
        label="Back"
        @click="emit('back')"
      />
      <p class="text-sm text-muted">
        Didn't receive a code?
        <UButton
          type="button"
          variant="link"
          class="px-1 text-primary"
          :disabled="props.resendSeconds > 0 || props.isSending"
          @click="emit('resend')"
        >
          Resend code
        </UButton>
        <span v-if="props.resendSeconds > 0">in {{ resendCountdown }}</span>
      </p>
    </div>
  </div>
</template>
