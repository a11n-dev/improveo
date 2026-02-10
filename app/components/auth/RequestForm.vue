<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import type { z } from "zod";

import {
  EMAIL_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NAME_MIN_LENGTH,
} from "~~/shared/constants/validation";
import type {
  AuthLoginInput,
  AuthRegisterInput,
} from "~~/shared/validation/auth";

type AuthFormOutput = AuthLoginInput | AuthRegisterInput;

interface Props {
  schema: z.ZodTypeAny;
  isRegister: boolean;
  isSending: boolean;
  canSubmit?: boolean;
  resendSeconds?: number;
}

const props = withDefaults(defineProps<Props>(), {
  canSubmit: true,
  resendSeconds: 0,
});

const state = defineModel<{
  name: string;
  email: string;
}>("state", { required: true });

type FormInstance = {
  clear: (path?: string | RegExp) => void;
};

const form = ref<FormInstance | null>(null);

const emit = defineEmits<{
  submit: [event: FormSubmitEvent<AuthFormOutput>];
}>();

const handleSubmit = (event: FormSubmitEvent<unknown>) => {
  emit("submit", event as FormSubmitEvent<AuthFormOutput>);
};

const resendCountdown = computed(() => formatCountdown(props.resendSeconds));

watch(
  () => props.isRegister,
  () => {
    form.value?.clear();
  },
);
</script>

<template>
  <UForm
    ref="form"
    :state="state"
    :schema="props.schema"
    class="flex flex-col gap-5"
    :validate-on="[]"
    @submit="handleSubmit"
  >
    <p class="text-sm text-muted">
      {{
        props.isRegister
          ? "Create an account to get started."
          : "Build better habits with a focused tracker that helps you stay consistent."
      }}
    </p>
    <div class="space-y-3">
      <UFormField
        v-if="props.isRegister"
        label="Display name"
        name="name"
        :hint="
          state.name.trim().length < PROFILE_NAME_MIN_LENGTH
            ? `Min ${PROFILE_NAME_MIN_LENGTH} characters`
            : undefined
        "
        required
      >
        <UInput
          v-model="state.name"
          class="w-full"
          placeholder="e.g. Alex Johnson"
          autocomplete="name"
          :minlength="PROFILE_NAME_MIN_LENGTH"
          :maxlength="PROFILE_NAME_MAX_LENGTH"
          @update:model-value="form?.clear('name')"
        />
      </UFormField>

      <UFormField label="Email address" name="email" required>
        <UInput
          v-model="state.email"
          class="w-full"
          type="email"
          placeholder="example@example.com"
          autocomplete="email"
          :maxlength="EMAIL_MAX_LENGTH"
          @update:model-value="form?.clear('email')"
        />
      </UFormField>
    </div>

    <UButton
      type="submit"
      :loading="props.isSending"
      :disabled="props.isSending || !props.canSubmit"
      :label="props.isRegister ? 'Sign up' : 'Sign in'"
      variant="solid"
      block
    />

    <p v-if="props.resendSeconds > 0" class="text-sm text-muted">
      You can request another code in {{ resendCountdown }}.
    </p>
  </UForm>
</template>
