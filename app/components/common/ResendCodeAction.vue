<script setup lang="ts">
interface Props {
  secondsLeft: number;
  canRequest: boolean;
  label?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: "Request another code",
});

const emit = defineEmits<{
  request: [];
}>();

const resendCountdown = computed(() => formatCountdown(props.secondsLeft));
const isCoolingDown = computed(() => props.secondsLeft > 0);

const handleRequest = (): void => {
  if (isCoolingDown.value || !props.canRequest) {
    return;
  }

  emit("request");
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
      :disabled="!props.canRequest"
      @click="handleRequest"
    >
      {{ props.label }}
    </UButton>
    <span v-else>{{ props.label }} in {{ resendCountdown }}</span>
  </p>
</template>
