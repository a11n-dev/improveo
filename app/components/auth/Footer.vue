<script setup lang="ts">
import type { AuthMode, AuthStep } from "~/types/auth";

interface Props {
  mode: AuthMode;
  step: AuthStep;
  resendSeconds: number;
  canRequestCode?: boolean;
}

const {
  mode,
  step,
  resendSeconds,
  canRequestCode = true,
} = defineProps<Props>();

const emit = defineEmits<{
  request: [];
  "toggle-mode": [];
}>();
</script>

<template>
  <div class="mt-2">
    <p v-if="step === 'request'" class="text-sm text-muted">
      <template v-if="mode === 'register'">
        <span>Already have an account?</span>
        <UButton
          type="button"
          variant="link"
          class="ml-1 p-0! text-primary"
          @click="emit('toggle-mode')"
        >
          Log in
        </UButton>
      </template>

      <template v-else>
        <span>Don’t have an account?</span>
        <UButton
          type="button"
          variant="link"
          class="ml-1 p-0! text-primary"
          @click="emit('toggle-mode')"
        >
          Create one
        </UButton>
      </template>
    </p>

    <CommonResendCodeAction
      v-else
      :seconds-left="resendSeconds"
      :can-request="canRequestCode"
      @request="emit('request')"
    />
  </div>
</template>
