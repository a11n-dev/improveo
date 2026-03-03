<script setup lang="ts">
interface Props {
  pendingEmail: string;
  disabled?: boolean;
}

const { pendingEmail, disabled = false } = defineProps<Props>();

const emit = defineEmits<{
  complete: [];
}>();

const otpValue = defineModel<number[]>("otpValue", { default: () => [] });
</script>

<template>
  <div class="space-y-4">
    <p class="text-sm text-muted">
      Enter the 6-digit code sent to
      <span class="font-medium text-highlighted">{{ pendingEmail }}</span>
    </p>

    <UPinInput
      v-model="otpValue"
      :length="6"
      otp
      size="xl"
      type="number"
      placeholder="·"
      class="w-full justify-between"
      :disabled="disabled"
      @complete="emit('complete')"
    />
  </div>
</template>
