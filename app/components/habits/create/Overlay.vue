<script setup lang="ts">
type HabitCreateDraft = {
  name: string;
  description: string;
  icon: string | null;
  color: HabitColor | null;
  goal: Goal | null;
};

const { isOpen, closeOverlay } = useHabitCreateOverlay();
const habitsStore = useHabitsStore();

const emit = defineEmits<{
  created: [];
}>();

const modalProps = {
  close: false,
};

/** Returns initial empty draft values for create form state. */
const createDefaultDraft = (): HabitCreateDraft => ({
  name: "",
  description: "",
  icon: null,
  color: null,
  goal: null,
});

/** Draft state for create habit form fields. */
const draft = ref<HabitCreateDraft>(createDefaultDraft());

/** Tracks create request progress to prevent duplicate submissions. */
const isCreating = ref(false);

/** Returns formatted goal label for the create form button. */
const goalLabel = computed<string>(() => {
  const { goal } = draft.value;

  if (!goal) {
    return "None";
  }

  return formatGoalLabel(goal.periodType, goal.targetCount);
});

/** Validates required fields before enabling create action. */
const isValid = computed<boolean>(() => {
  const { name, icon, color } = draft.value;

  return name.trim().length > 0 && icon !== null && color !== null;
});

/** Resets create draft values when overlay closes or reopens. */
const resetDraft = (): void => {
  draft.value = createDefaultDraft();
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
    const payload: HabitCreatePayload = {
      title: draft.value.name,
      description: draft.value.description || undefined,
      icon: draft.value.icon!,
      color: draft.value.color!,
      goal: draft.value.goal,
    };

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
