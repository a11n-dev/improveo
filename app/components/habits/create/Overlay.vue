<script setup lang="ts">
const { isOpen, closeOverlay } = useHabitCreateOverlay();
const { draft, goalLabel, isValid, resetDraft } = useHabitDraft();
const { createHabit } = useHabits();

const emit = defineEmits<{
  created: [];
}>();

const modalProps = {
  close: false,
};

/** Tracks create request progress to prevent duplicate submissions. */
const isCreating = ref(false);

/** Submits the current draft and closes the overlay when creation succeeds. */
const handleCreate = async (): Promise<void> => {
  if (!isValid.value || isCreating.value) {
    return;
  }

  isCreating.value = true;

  try {
    const payload: HabitCreatePayload = {
      title: draft.value.name,
      description: draft.value.description || undefined,
      icon: draft.value.icon!,
      color: draft.value.color!,
      goal: draft.value.goal,
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
        label: 'Create',
        color: 'primary',
        disabled: !isValid,
        loading: isCreating,
        onClick: handleCreate,
      },
    ]"
    @after:leave="resetDraft"
  >
    <template #header>
      <HabitsCreateHeader @close="closeOverlay" />
    </template>

    <template #body>
      <HabitsFormBase v-model:draft="draft" :goal-label="goalLabel" />
    </template>
  </CommonOverlay>
</template>
