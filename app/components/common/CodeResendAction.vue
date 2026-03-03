<script setup lang="ts">
interface Props {
  secondsLeft: number;
  canResend: boolean;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: "Resend code",
});

const emit = defineEmits<{
  resend: [];
}>();

const resendCountdown = computed(() => formatCountdown(props.secondsLeft));
const isCoolingDown = computed(() => props.secondsLeft > 0);

const handleResend = (): void => {
  if (isCoolingDown.value || !props.canResend) {
    return;
  }

  emit("resend");
};
</script>

<template>
  <p class="text-center text-sm text-muted">
    Didn&apos;t receive a code?
    <UButton
      v-if="!isCoolingDown"
      type="button"
      variant="link"
      class="ml-1 p-0! text-primary"
      :disabled="!props.canResend"
      @click="handleResend"
    >
      {{ props.label }}
    </UButton>
    <span v-else>{{ props.label }} in {{ resendCountdown }}</span>
  </p>
</template>
