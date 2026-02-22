<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import { z } from "zod";

import { EMAIL_MAX_LENGTH } from "~~/shared/constants/validation";
import { EmailSchema } from "~~/shared/validation/auth";

interface Props {
  isSending?: boolean;
}

const { isSending = false } = defineProps<Props>();

const schema = z.object({
  email: EmailSchema,
});

type Schema = z.output<typeof schema>;

const state = defineModel<{
  email: string;
}>("state", { required: true });

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
      label="Sign in"
      variant="solid"
      block
    />
  </UForm>
</template>
