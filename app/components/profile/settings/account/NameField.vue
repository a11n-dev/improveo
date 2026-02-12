<script setup lang="ts">
import { PROFILE_NAME_MAX_LENGTH } from "~~/shared/constants/validation";

const { nameError = "", disabled = false } = defineProps<{
  nameError?: string;
  disabled?: boolean;
}>();

const name = defineModel<string>("name", { required: true });
</script>

<template>
  <UFormField
    label="Name"
    name="name"
    :error="nameError || undefined"
    help="Shown on your profile."
  >
    <UInput
      v-model="name"
      class="w-full"
      :maxlength="PROFILE_NAME_MAX_LENGTH"
      :disabled="disabled"
    />
  </UFormField>
</template>
