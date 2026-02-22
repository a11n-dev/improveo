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
  name: UsernameSchema,
});

type Schema = z.output<typeof schema>;

const state = defineModel<{
  email: string;
  name: string;
}>("state", { required: true });

/** Normalizes username to lowercase on input. */
const username = computed({
  get: () => state.value.name ?? "",
  set: (value: string) => {
    state.value.name = value.toLowerCase();
  },
});

const emit = defineEmits<{
  submit: [payload: Schema];
}>();

/** Forwards successful Nuxt UI form submit to parent flow controller. */
const handleSubmit = (event: FormSubmitEvent<Schema>): void => {
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
    <UFormField label="Username" name="name" required>
      <UInput
        v-model="username"
        class="w-full"
        placeholder="alexdoe27"
        autocomplete="username"
        :minlength="PROFILE_NAME_MIN_LENGTH"
        :maxlength="PROFILE_NAME_MAX_LENGTH"
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
      :disabled="isSending"
      label="Sign up"
      variant="solid"
      block
    />
  </UForm>
</template>
