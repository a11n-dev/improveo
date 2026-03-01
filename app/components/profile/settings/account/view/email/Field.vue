<script setup lang="ts">
interface Props {
  email: string;
  disabled?: boolean;
}

const { email, disabled = false } = defineProps<Props>();

const emit = defineEmits<{
  open: [];
}>();

const displayEmail = computed(() => email.trim() || "Email");

/** Opens the email flow only when the row is interactive. */
const handleOpen = (): void => {
  if (disabled) {
    return;
  }

  emit("open");
};
</script>

<template>
  <ProfileSettingsField
    :title="displayEmail"
    clickable
    show-chevron
    :class="disabled ? 'opacity-70' : undefined"
    @click="handleOpen"
  />
</template>
