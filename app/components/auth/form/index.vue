<script setup lang="ts">
import type { AuthMode, AuthStep } from "~/types/auth";

interface RequestState {
  username: string;
  email: string;
}

interface RequestPayload {
  email: string;
  username?: string;
}

interface Props {
  mode: AuthMode;
  step: AuthStep;
  isSending?: boolean;
  isVerifying?: boolean;
}

const {
  mode,
  step,
  isSending = false,
  isVerifying = false,
} = defineProps<Props>();

const state = defineModel<RequestState>("state", { required: true });
const otpValue = defineModel<number[]>("otpValue", { default: () => [] });

const emit = defineEmits<{
  back: [];
  request: [payload: RequestPayload];
  verify: [];
}>();
</script>

<template>
  <div>
    <AuthFormLogin
      v-if="step === 'request' && mode === 'login'"
      v-model:state="state"
      :is-sending="isSending"
      @submit="emit('request', $event)"
    />

    <AuthFormRegister
      v-else-if="step === 'request'"
      v-model:state="state"
      :is-sending="isSending"
      @submit="emit('request', $event)"
    />

    <AuthFormVerify
      v-else
      v-model:otp-value="otpValue"
      :email="state.email"
      :is-sending="isSending"
      :is-verifying="isVerifying"
      @verify="emit('verify')"
      @back="emit('back')"
    />
  </div>
</template>
