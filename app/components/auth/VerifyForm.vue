<script setup lang="ts">
interface Props {
  email: string;
  resendSeconds: number;
  isSending: boolean;
  isVerifying: boolean;
}

const props = defineProps<Props>();

const otpValue = defineModel<number[]>("otpValue", { default: () => [] });

const emit = defineEmits<{
  verify: [];
  back: [];
  request: [];
}>();
const canVerify = computed(
  () => props.email.trim().length > 0 && otpValue.value.length === 6,
);

const canRequestCode = computed(() => !props.isSending && !props.isVerifying);
</script>

<template>
  <div class="flex flex-col gap-4">
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
      type="number"
      @complete="emit('verify')"
    />

    <div class="flex flex-col gap-2">
      <UButton
        type="button"
        block
        :loading="props.isVerifying"
        :disabled="!canVerify"
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
        @click="emit('back')"
      />

      <CommonResendCodeAction
        :seconds-left="props.resendSeconds"
        :can-request="canRequestCode"
        @request="emit('request')"
      />
    </div>
  </div>
</template>
