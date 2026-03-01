<script setup lang="ts">
interface Props {
  habit: Habit;
}

type HabitEditDraft = {
  name: string;
  description: string;
  icon: string | null;
  color: HabitColor | null;
  goal: Goal | null;
};

const { habit } = defineProps<Props>();

const emit = defineEmits<{
  "after:leave": [];
}>();

const open = defineModel<boolean>("open", { default: false });

const habitsStore = useHabitsStore();

/** Tracks save request progress to prevent duplicate submissions. */
const isSaving = ref(false);

/** Returns initial empty values used before edit state initialization. */
const createDefaultDraft = (): HabitEditDraft => ({
  name: "",
  description: "",
  icon: null,
  color: null,
  goal: null,
});

/** Local editable draft initialized from the selected habit. */
const draft = ref<HabitEditDraft>(createDefaultDraft());

/** Original habit values captured at overlay open for change detection. */
const originalDraft = ref<HabitEditDraft | null>(null);

const modalProps = {
  close: false,
};

/**
 * Maps a persisted habit record to overlay draft values.
 * Goal values are projected to editable shape.
 */
const mapHabitToDraft = (source: Habit): HabitEditDraft => ({
  name: source.title,
  description: source.description ?? "",
  icon: source.icon,
  color: source.color as HabitColor,
  goal: source.goal
    ? {
        periodType: source.goal.periodType,
        targetCount: source.goal.targetCount,
      }
    : null,
});

/** Creates a safe draft clone so local edits never mutate source objects. */
const cloneDraft = (source: HabitEditDraft): HabitEditDraft => ({
  ...source,
  goal: source.goal ? { ...source.goal } : null,
});

/** Resets local edit state after overlay transition completes. */
const resetDraft = (): void => {
  draft.value = createDefaultDraft();
  originalDraft.value = null;
};

/** Initializes local edit state from the current habit prop. */
const initializeDraftFromHabit = (): void => {
  const values = mapHabitToDraft(habit);
  draft.value = cloneDraft(values);
  originalDraft.value = cloneDraft(values);
};

/** Returns formatted goal label for the edit form button. */
const goalLabel = computed<string>(() => {
  const { goal } = draft.value;

  if (!goal) {
    return "None";
  }

  return formatGoalLabel(goal.periodType, goal.targetCount);
});

/** Validates required fields before enabling save action. */
const isValid = computed<boolean>(() => {
  const { name, icon, color } = draft.value;

  return name.trim().length > 0 && icon !== null && color !== null;
});

/** Compares two goal objects for semantic equality. */
const isGoalEqual = (left: Goal | null, right: Goal | null): boolean => {
  if (!left || !right) {
    return left === right;
  }

  return (
    left.periodType === right.periodType &&
    left.targetCount === right.targetCount
  );
};

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
    const payload: HabitUpdatePayload = {
      title: draft.value.name,
      description: draft.value.description || null,
      icon: draft.value.icon!,
      color: draft.value.color!,
      goal: draft.value.goal,
    };

    const updated = await habitsStore.updateHabit(habit.id, payload);

    if (updated) {
      open.value = false;
    }
  } finally {
    isSaving.value = false;
  }
};

/** Closes the edit overlay without persisting changes. */
const handleCancel = (): void => {
  open.value = false;
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
