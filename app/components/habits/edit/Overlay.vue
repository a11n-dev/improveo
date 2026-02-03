<script setup lang="ts">
interface Props {
  habit: Habit;
}

const props = defineProps<Props>();

const { isOpen, closeOverlay } = useHabitEditOverlay();
const { draft, hasChanges, isValid } = useHabitEditDraft();
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
    const hasStreak = draft.value.streak !== null;

    const payload: HabitUpdatePayload = {
      title: draft.value.name,
      description: draft.value.description || null,
      icon: draft.value.icon!,
      color: draft.value.color!,
      streakInterval: hasStreak ? draft.value.streak!.interval : null,
      streakCount: hasStreak ? draft.value.streak!.count : 0,
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
  <ResponsiveOverlay
    v-model:open="isOpen"
    :modal-props="modalProps"
    :drawer-props="drawerProps"
  >
    <template #header>
      <HabitsEditHeader @close="handleCancel" />
    </template>

    <template #body>
      <HabitsEditForm />
    </template>

    <template #footer>
      <div class="flex w-full flex-col gap-2">
        <UButton
          label="Save"
          color="primary"
          block
          :disabled="!isValid"
          :loading="isSaving"
          @click="handleSave"
        />
        <UButton
          label="Cancel"
          color="neutral"
          variant="subtle"
          block
          :disabled="isSaving"
          @click="handleCancel"
        />
      </div>
    </template>
  </ResponsiveOverlay>
</template>
