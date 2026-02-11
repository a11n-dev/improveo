<script setup lang="ts">
interface Props {
  habit: Habit;
}

const props = defineProps<Props>();

const { isOpen, closeOverlay } = useHabitEditOverlay();
const { draft, hasChanges, isValid, resetDraft } = useHabitEditDraft();
const { updateHabit } = useHabits();

/** Loading state for save action */
const isSaving = ref(false);

const modalProps = {
  close: false,
};

const drawerProps = {
  nested: true,
};

/** Handle save */
const handleSave = async () => {
  // Don't call API if nothing changed
  if (!hasChanges.value) {
    closeOverlay();
    return;
  }

  if (!isValid.value || isSaving.value) return;

  isSaving.value = true;

  try {
    // Build payload with all fields
    const payload: HabitUpdatePayload = {
      title: draft.value.name,
      description: draft.value.description || null,
      icon: draft.value.icon!,
      color: draft.value.color!,
      goal: draft.value.goal,
    };

    const updated = await updateHabit(props.habit.id, payload);

    if (updated) {
      closeOverlay();
      // No success toast - user sees changes immediately
    }
  } finally {
    isSaving.value = false;
  }
};

/** Handle cancel */
const handleCancel = () => {
  closeOverlay();
};
</script>

<template>
  <CommonOverlay
    v-model:open="isOpen"
    :modal-props="modalProps"
    :drawer-props="drawerProps"
    :actions="[
      {
        label: 'Save',
        color: 'primary',
        disabled: !hasChanges || !isValid,
        loading: isSaving,
        onClick: handleSave,
      },
    ]"
    @after:leave="resetDraft"
  >
    <template #header>
      <HabitsEditHeader @close="handleCancel" />
    </template>

    <template #body>
      <HabitsEditForm />
    </template>
  </CommonOverlay>
</template>
