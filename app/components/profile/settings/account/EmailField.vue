<script setup lang="ts">
const { email, disabled = false } = defineProps<{
  email: string;
  disabled?: boolean;
}>();
const emit = defineEmits<{
  (e: "open"): void;
}>();
</script>

<template>
  <UFormField
    label="Email"
    name="email"
    help="Used for sign in and syncing across your devices."
  >
    <UButton
      color="neutral"
      variant="subtle"
      block
      class="justify-between"
      :disabled="disabled"
      @click="emit('open')"
    >
      <span class="max-w-full truncate text-left text-sm">{{ email }}</span>
      <UIcon name="i-lucide-chevron-right" class="size-4" />
    </UButton>
  </UFormField>
</template>
