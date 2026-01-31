<script setup lang="ts">
const { openOverlay } = useHabitCreateOverlay();
</script>

<template>
  <div
    class="fixed bottom-8 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 px-4"
  >
    <UNavigationMenu
      :items="navigationLinks"
      variant="link"
      color="neutral"
      orientation="horizontal"
      class="rounded-full border border-muted/50 bg-muted/80 px-2 shadow-lg shadow-neutral-950/5 backdrop-blur-sm sm:px-4"
      :ui="{
        link: 'px-2 py-1 flex items-center gap-2',
        linkLeadingIcon: 'size-4',
      }"
    />

    <UButton
      icon="i-lucide-plus"
      square
      size="xl"
      class="hidden rounded-full shadow-lg md:inline-flex"
      aria-label="Create habit"
      @click="openOverlay"
    />
  </div>
</template>
