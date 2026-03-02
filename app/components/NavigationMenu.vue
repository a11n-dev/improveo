<script setup lang="ts">
import { motion } from "motion-v";

const { openOverlay } = useHabitCreateOverlay();
const { shellTransition, shellVariant, shellVariants } = useShiftMotion();
</script>

<template>
  <motion.div
    class="pointer-events-none fixed inset-x-0 bottom-8 z-50"
    :initial="false"
    :variants="shellVariants"
    :animate="shellVariant"
    :transition="shellTransition"
  >
    <div class="pointer-events-auto mx-auto flex w-fit items-center gap-3 px-4">
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
        color="primary"
        class="hidden rounded-full p-3 shadow-lg md:inline-flex"
        aria-label="Create habit"
        @click="openOverlay"
      />
    </div>
  </motion.div>
</template>
