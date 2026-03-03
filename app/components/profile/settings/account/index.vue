<script setup lang="ts">
const emit = defineEmits<{
  open: [];
}>();

/** Opens the dedicated account settings screen. */
const handleOpen = (): void => {
  emit("open");
};
</script>

<template>
  <ProfileSettingsField
    title="Account"
    description="Manage your profile details"
    icon="i-lucide-user-round"
    clickable
    show-chevron
    @click="handleOpen"
  />
</template>
