<script setup lang="ts">
interface EmailChangeFormState {
  nextEmail: string;
  confirmEmail: string;
}

interface Props {
  currentEmail: string;
  disabled?: boolean;
}

const { currentEmail, disabled = false } = defineProps<Props>();

const state = defineModel<EmailChangeFormState>("state", { required: true });
</script>

<template>
  <div class="space-y-4">
    <UFormField label="New email" name="nextEmail" required>
      <UInput
        v-model="state.nextEmail"
        class="w-full"
        type="email"
        placeholder="name@example.com"
        :disabled="disabled"
      />
    </UFormField>

    <UFormField label="Confirm new email" name="confirmEmail" required>
      <UInput
        v-model="state.confirmEmail"
        class="w-full"
        type="email"
        placeholder="Repeat email"
        :disabled="disabled"
      />
    </UFormField>

    <div class="space-y-0">
      <p class="break-all text-sm text-muted">Current: {{ currentEmail }}</p>
      <p class="text-sm text-muted">
        Enter a new email address for your account.
      </p>
    </div>
  </div>
</template>
