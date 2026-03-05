<script setup lang="ts">
import { motion } from "motion-v";

const { openOverlay } = useHabitCreateOverlay();
const { shellTransition, shellVariant, shellVariants } = useShiftMotion();
</script>

<template>
  <motion.div
    class="pointer-events-none fixed inset-x-0 bottom-22 z-50 transform-gpu will-change-transform md:hidden"
    :initial="false"
    :variants="shellVariants"
    :animate="shellVariant"
    :transition="shellTransition"
  >
    <div class="pointer-events-auto mr-4 ml-auto w-fit sm:mr-6">
      <UButton
        icon="i-lucide-plus"
        square
        size="xl"
        variant="solid"
        color="primary"
        class="rounded-full p-4.5 shadow-md"
        aria-label="Create habit"
        @click="openOverlay"
      />
    </div>
  </motion.div>
</template>
