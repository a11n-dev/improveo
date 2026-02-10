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
      class="rounded-full border border-muted/50 bg-muted/80 px-2.5 py-0.5 shadow-lg shadow-neutral-950/5 backdrop-blur-sm"
      :ui="{
        link: 'flex items-center gap-2 px-2.25 py-1.25',
        linkLeadingIcon: 'size-4.5',
      }"
    />

    <UButton
      icon="i-lucide-plus"
      square
      size="xl"
      variant="solid"
      class="hidden rounded-full p-3 shadow-lg md:inline-flex"
      aria-label="Create habit"
      @click="openOverlay"
    />
  </div>
</template>
