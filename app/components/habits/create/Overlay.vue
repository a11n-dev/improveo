<script setup lang="ts">
const { isOpen, closeOverlay } = useHabitCreateOverlay();
const { draft, isValid, resetDraft } = useHabitDraft();
const { createHabit } = useHabits();

const modalProps = {
  close: false,
};

/** Loading state for create action */
const isCreating = ref(false);

/** Handle create */
const handleCreate = async () => {
  if (!isValid.value || isCreating.value) return;

  isCreating.value = true;

  try {
    // When streak is not set (None selected), send null for interval and 0 for count
    const hasStreak = draft.value.streak !== null;

    const payload: HabitCreatePayload = {
      title: draft.value.name,
      description: draft.value.description || undefined,
      icon: draft.value.icon!,
      color: draft.value.color!,
      streakInterval: hasStreak ? draft.value.streak!.interval : null,
      streakCount: hasStreak ? draft.value.streak!.count : 0,
    };

    const created = await createHabit(payload);

    if (created) {
      resetDraft();
      closeOverlay();
    }
  } finally {
    isCreating.value = false;
  }
};

/** Reset draft when overlay closes */
watch(isOpen, (open) => {
  if (!open) {
    resetDraft();
  }
});
</script>

<template>
  <HabitsOverlayResponsive v-model:open="isOpen" :modal-props="modalProps">
    <template #header>
      <HabitsCreateHeader @close="closeOverlay" />
    </template>

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
          :loading="isCreating"
          @click="handleCreate"
        />
        <UButton
          label="Cancel"
          color="neutral"
          variant="subtle"
          block
          :disabled="isCreating"
          @click="closeOverlay"
        />
      </div>
    </template>
  </HabitsOverlayResponsive>
</template>
