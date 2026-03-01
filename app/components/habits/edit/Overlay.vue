<script setup lang="ts">
interface Props {
  habit: Habit;
}

const { habit } = defineProps<Props>();

const emit = defineEmits<{
  "after:leave": [];
}>();

const { isOpen, closeOverlay } = useHabitEditOverlay();
const { draft, goalLabel, hasChanges, isValid, resetDraft } =
  useHabitEditDraft();
const { updateHabit } = useHabits();

/** Tracks save request progress to prevent duplicate submissions. */
const isSaving = ref(false);

const modalProps = {
  close: false,
};

/**
 * Persists habit changes and closes the overlay when save succeeds.
 * If no fields changed, closes immediately without calling the API.
 */
const handleSave = async (): Promise<void> => {
  if (!hasChanges.value) {
    closeOverlay();
    return;
  }

  if (!isValid.value || isSaving.value) {
    return;
  }

  isSaving.value = true;

  try {
    const payload: HabitUpdatePayload = {
      title: draft.value.name,
      description: draft.value.description || null,
      icon: draft.value.icon!,
      color: draft.value.color!,
      goal: draft.value.goal,
    };

    const updated = await updateHabit(habit.id, payload);

    if (updated) {
      closeOverlay();
    }
  } finally {
    isSaving.value = false;
  }
};

/** Closes the edit overlay without persisting changes. */
const handleCancel = (): void => {
  closeOverlay();
};

/** Clears edit draft state after overlay transition completes. */
const handleAfterLeave = (): void => {
  resetDraft();
  emit("after:leave");
};
</script>

<template>
  <CommonOverlay
    v-model:open="isOpen"
    :modal-props="modalProps"
    :actions="[
      {
        label: 'Save',
        color: 'primary',
        disabled: !hasChanges || !isValid,
        loading: isSaving,
        onClick: handleSave,
      },
    ]"
    @after:leave="handleAfterLeave"
  >
    <template #header>
      <HabitsEditHeader @close="handleCancel" />
    </template>

    <template #body>
      <HabitsFormBase v-model:draft="draft" :goal-label="goalLabel" />
    </template>
  </CommonOverlay>
</template>
