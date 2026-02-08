<script setup lang="ts">
/** Handle habit created event from layout overlay */
const handleHabitCreated = () => {
  window.dispatchEvent(new CustomEvent("habit-created"));
};
</script>

<template>
  <div class="min-h-dvh pb-20">
    <slot />
    <NavigationMenu />
    <HabitsCreateFab />
    <LazyHabitsCreateOverlay @created="handleHabitCreated" />
  </div>
</template>
