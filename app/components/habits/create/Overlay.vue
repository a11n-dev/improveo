<script setup lang="ts">
const { isOpen, closeOverlay } = useHabitCreateOverlay();
const { draft, isValid, resetDraft } = useHabitDraft();
const { createHabit } = useHabits();

const emit = defineEmits<{
  created: [];
}>();

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
      emit("created");
    }
  } finally {
    isCreating.value = false;
  }
};
</script>

<template>
  <CommonOverlay
    v-model:open="isOpen"
    :modal-props="modalProps"
    :actions="[
      {
        label: 'Create habit',
        color: 'primary',
        disabled: !isValid,
        loading: isCreating,
        onClick: handleCreate,
      },
      {
        label: 'Cancel',
        color: 'secondary',
        disabled: isCreating,
        onClick: closeOverlay,
      },
    ]"
    @after:leave="resetDraft"
  >
    <template #header>
      <HabitsCreateHeader @close="closeOverlay" />
    </template>

    <template #body>
      <HabitsCreateForm />
    </template>
  </CommonOverlay>
</template>
