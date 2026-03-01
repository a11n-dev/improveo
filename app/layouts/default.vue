<script setup lang="ts">
import { motion } from "motion-v";

const route = useRoute();
const shouldScrollAfterHabitCreate = useState<boolean>(
  "habit-created-pending-scroll",
  () => false,
);

const { shellTransition, shellVariant, shellVariants } = useShellShiftMotion();

/** Redirect to home after creation and request a post-navigation scroll. */
const handleHabitCreated = async () => {
  shouldScrollAfterHabitCreate.value = true;

  if (route.path !== "/") {
    await navigateTo("/");
  }
};
</script>

<template>
  <div class="overflow-x-hidden">
    <motion.div
      class="min-h-(--app-vh) will-change-transform pb-22"
      :initial="false"
      :variants="shellVariants"
      :animate="shellVariant"
      :transition="shellTransition"
    >
      <slot />
    </motion.div>

    <NavigationMenu />
    <HabitsCreateFab />
    <LazyHabitsCreateOverlay @created="handleHabitCreated" />
  </div>
</template>
