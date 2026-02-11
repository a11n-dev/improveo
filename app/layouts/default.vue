<script setup lang="ts">
const route = useRoute();
const shouldScrollAfterHabitCreate = useState<boolean>(
  "habit-created-pending-scroll",
  () => false,
);

/** Redirect to home after creation and request a post-navigation scroll. */
const handleHabitCreated = async () => {
  shouldScrollAfterHabitCreate.value = true;

  if (route.path !== "/") {
    await navigateTo("/");
  }
};
</script>

<template>
  <div class="min-h-(--app-vh) pb-22">
    <slot />
    <NavigationMenu />
    <HabitsCreateFab />
    <LazyHabitsCreateOverlay @created="handleHabitCreated" />
  </div>
</template>
