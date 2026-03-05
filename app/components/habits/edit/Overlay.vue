<script setup lang="ts">
import type { HabitFormDraft } from "~/types/habit";

import {
  cloneHabitDraft,
  createHabitDraft,
  getGoalLabel,
  isGoalEqual,
  isHabitDraftValid,
  mapDraftToUpdatePayload,
  mapHabitToDraft,
} from "~/utils/habits";

interface Props {
  habit: Habit;
}

const { habit } = defineProps<Props>();

const emit = defineEmits<{
  "after:leave": [];
}>();

const open = defineModel<boolean>("open", { default: false });

const habitsStore = useHabitsStore();

/** Tracks save request progress to prevent duplicate submissions. */
const isSaving = ref(false);

/** Local editable draft initialized from the selected habit. */
const draft = ref<HabitFormDraft>(createHabitDraft());

/** Original habit values captured at overlay open for change detection. */
const originalDraft = ref<HabitFormDraft | null>(null);

const modalProps = {
  close: false,
};

/** Resets local edit state after overlay transition completes. */
const resetDraft = (): void => {
  draft.value = createHabitDraft();
  originalDraft.value = null;
};

/** Initializes local edit state from the current habit prop. */
const initializeDraftFromHabit = (): void => {
  const values = mapHabitToDraft(habit);
  draft.value = cloneHabitDraft(values);
  originalDraft.value = cloneHabitDraft(values);
};

/** Returns formatted goal label for the edit form button. */
const goalLabel = computed<string>(() => {
  return getGoalLabel(draft.value.goal);
});

/** Validates required fields before enabling save action. */
const isValid = computed<boolean>(() => {
  return isHabitDraftValid(draft.value);
});

/** Indicates whether current draft differs from original values. */
const hasChanges = computed<boolean>(() => {
  if (!originalDraft.value) {
    return false;
  }

  return (
    originalDraft.value.name !== draft.value.name ||
    originalDraft.value.description !== draft.value.description ||
    originalDraft.value.icon !== draft.value.icon ||
    originalDraft.value.color !== draft.value.color ||
    !isGoalEqual(originalDraft.value.goal, draft.value.goal)
  );
});

/** Initializes edit draft every time the overlay becomes visible. */
watch(open, (value): void => {
  if (!value) {
    return;
  }

  initializeDraftFromHabit();
});

/**
 * Persists habit changes and closes the overlay when save succeeds.
 * If no fields changed, closes immediately without calling the API.
 */
const handleSave = async (): Promise<void> => {
  if (!hasChanges.value) {
    open.value = false;
    return;
  }

  if (!isValid.value || isSaving.value) {
    return;
  }

  isSaving.value = true;

  try {
    const payload = mapDraftToUpdatePayload(draft.value);

    const updated = await habitsStore.updateHabit(habit.id, payload);

    if (updated) {
      open.value = false;
    }
  } finally {
    isSaving.value = false;
  }
};

/** Clears edit draft state after overlay transition completes. */
const handleAfterLeave = (): void => {
  resetDraft();
  emit("after:leave");
};
</script>

<template>
  <CommonOverlay
    v-model:open="open"
    title="Edit Habit"
    description="Update your habit details."
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
    <template #body>
      <HabitsFormBase v-model:draft="draft" :goal-label="goalLabel" />
    </template>
  </CommonOverlay>
</template>
