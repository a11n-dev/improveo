<script setup lang="ts">
const emit = defineEmits<{
  open: [];
}>();

/** Opens the dedicated appearance settings screen. */
const handleOpen = (): void => {
  emit("open");
};
</script>

<template>
  <ProfileSettingsField
    title="Appearance"
    description="Manage your visual preferences"
    icon="i-lucide-palette"
    clickable
    show-chevron
    @click="handleOpen"
  />
</template>
