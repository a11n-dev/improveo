<script setup lang="ts">
import type { HabitFormDraft } from "~/types/habit";

import {
  createHabitDraft,
  getGoalLabel,
  isHabitDraftValid,
  mapDraftToCreatePayload,
} from "~/utils/habits";

const { isOpen, closeOverlay } = useHabitCreateOverlay();
const habitsStore = useHabitsStore();

const emit = defineEmits<{
  created: [];
}>();

const modalProps = {
  close: false,
};

/** Draft state for create habit form fields. */
const draft = ref<HabitFormDraft>(createHabitDraft());

/** Tracks create request progress to prevent duplicate submissions. */
const isCreating = ref(false);

/** Returns formatted goal label for the create form button. */
const goalLabel = computed<string>(() => {
  return getGoalLabel(draft.value.goal);
});

/** Validates required fields before enabling create action. */
const isValid = computed<boolean>(() => {
  return isHabitDraftValid(draft.value);
});

/** Resets create draft values when overlay closes or reopens. */
const resetDraft = (): void => {
  draft.value = createHabitDraft();
};

/** Ensures each open starts from a clean create draft. */
watch(isOpen, (value): void => {
  if (!value) {
    return;
  }

  resetDraft();
});

/** Submits the current draft and closes the overlay when creation succeeds. */
const handleCreate = async (): Promise<void> => {
  if (!isValid.value || isCreating.value) {
    return;
  }

  isCreating.value = true;

  try {
    const payload = mapDraftToCreatePayload(draft.value);

    const created = await habitsStore.createHabit(payload);

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
    title="Create Habit"
    description="Add a new habit to track."
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
    <template #body>
      <HabitsFormBase v-model:draft="draft" :goal-label="goalLabel" />
    </template>
  </CommonOverlay>
</template>
