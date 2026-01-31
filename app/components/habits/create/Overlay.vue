<script setup lang="ts">
const { isOpen, closeOverlay } = useHabitCreateOverlay();
const { isValid } = useHabitDraft();

const title = "Create Habit";
const description = "Add a new habit to track.";

const modalProps = {
  close: { onClick: closeOverlay },
};

/** Handle create (UI only for now) */
const handleCreate = () => {
  if (!isValid.value) return;
  // TODO: Actually create the habit
  closeOverlay();
};
</script>

<template>
  <HabitsOverlayResponsive
    v-model:open="isOpen"
    :title="title"
    :description="description"
    :modal-props="modalProps"
  >
    <template #body>
      <HabitsCreateForm />
    </template>

    <template #footer>
      <div class="flex w-full flex-col gap-2">
        <UButton
          label="Create"
          color="primary"
          block
          :disabled="!isValid"
          @click="handleCreate"
        />
        <UButton
          label="Cancel"
          color="neutral"
          variant="subtle"
          block
          @click="closeOverlay"
        />
      </div>
    </template>
  </HabitsOverlayResponsive>
</template>
