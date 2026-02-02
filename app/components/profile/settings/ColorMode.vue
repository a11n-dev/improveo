<script setup lang="ts">
/**
 * Color mode setting component.
 *
 * Provides a UColorModeSelect for switching between
 * system, light, and dark themes.
 */
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div class="flex flex-col gap-1 min-w-0 flex-1">
      <span class="text-sm font-medium text-highlighted">Appearance</span>
      <span class="text-xs text-muted">Choose your preferred color theme</span>
    </div>
    <UColorModeSelect class="w-34 shrink-0" variant="subtle" size="lg" />
  </div>
</template>
