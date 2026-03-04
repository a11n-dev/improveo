<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

import {
  EMAIL_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NAME_MIN_LENGTH,
} from "~~/shared/constants/validation";
import { EmailSchema, UsernameSchema } from "~~/shared/validation/auth";

interface Props {
  isSending?: boolean;
}

const { isSending = false } = defineProps<Props>();

const schema = z.object({
  email: EmailSchema,
  username: UsernameSchema,
});

type Schema = z.output<typeof schema>;

const state = defineModel<{
  email: string;
  username: string;
}>("state", { required: true });

/** Normalizes username to lowercase on input. */
const username = computed({
  get: () => state.value.username ?? "",
  set: (value: string) => {
    state.value.username = value.toLowerCase();
  },
});

const {
  availabilityError,
  isAvailable: isUsernameAvailable,
  isChecking: isCheckingUsername,
} = useUsernameCheck(username);

const usernameHint = computed(() => {
  if (isUsernameAvailable.value === true) {
    return "Username is available";
  }

  if (isUsernameAvailable.value === false) {
    return availabilityError.value ?? "Username is already taken";
  }

  return undefined;
});

const isSubmitDisabled = computed(
  () =>
    isSending ||
    isCheckingUsername.value ||
    isUsernameAvailable.value === false,
);

const emit = defineEmits<{
  submit: [payload: Schema];
}>();

/** Forwards successful Nuxt UI form submit to parent flow controller. */
const handleSubmit = (event: FormSubmitEvent<Schema>): void => {
  if (isCheckingUsername.value || isUsernameAvailable.value === false) {
    return;
  }

  emit("submit", event.data);
};
</script>

<template>
  <UForm
    :state="state"
    :schema="schema"
    :validate-on="[]"
    class="flex flex-col gap-4"
    @submit="handleSubmit"
  >
    <UFormField label="Username" name="username" required>
      <template #hint>
        <span
          v-if="usernameHint"
          :class="
            isUsernameAvailable === false
              ? 'text-error'
              : isUsernameAvailable === true
                ? 'text-success'
                : 'text-muted'
          "
        >
          {{ usernameHint }}
        </span>
      </template>

      <UInput
        v-model="username"
        class="w-full"
        placeholder="e.g. johndoe"
        autocomplete="username"
        :minlength="PROFILE_NAME_MIN_LENGTH"
        :maxlength="PROFILE_NAME_MAX_LENGTH"
        :loading="isCheckingUsername"
        trailing
        :leading="false"
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
      />
    </UFormField>

    <UButton
      type="submit"
      :loading="isSending"
      :disabled="isSubmitDisabled"
      label="Sign up"
      variant="solid"
      block
    />
  </UForm>
</template>
