<script setup lang="ts">
import { navigationLinks } from "~/utils/links";
</script>

<template>
  <div class="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 px-4">
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
  </div>
</template>
