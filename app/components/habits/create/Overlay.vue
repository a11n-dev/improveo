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
    // Build payload from draft
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
      <HabitsCreateForm />
    </template>
  </CommonOverlay>
</template>
