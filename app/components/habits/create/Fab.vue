<script setup lang="ts">
const { openOverlay } = useHabitCreateOverlay();
</script>

<template>
  <!-- FAB positioned bottom-right, above the navigation menu -->
  <div class="fixed bottom-22 right-4 z-50 sm:right-6 md:hidden">
    <UButton
      icon="i-lucide-plus"
      square
      size="xl"
      class="rounded-full"
      aria-label="Create habit"
      @click="openOverlay"
    />
  </div>
</template>
