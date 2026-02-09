/** Draft state for editing a habit */
export interface HabitEditDraft {
  name: string;
  description: string;
  icon: string | null;
  color: HabitColor | null;
  goal: Goal | null;
}

/** Original values from when edit started (for change detection) */
interface OriginalValues {
  name: string;
  description: string;
  icon: string | null;
  color: HabitColor | null;
  goal: Goal | null;
}

/** Default empty draft state */
const defaultDraft = (): HabitEditDraft => ({
  name: "",
  description: "",
  icon: null,
  color: null,
  goal: null,
});

/**
 * Composable for managing habit edit draft state.
 * Tracks original values to detect changes.
 */
export const useHabitEditDraft = () => {
  const draft = useState<HabitEditDraft>("habit-edit-draft", defaultDraft);
  const originalValues = useState<OriginalValues | null>(
    "habit-edit-original",
    () => null,
  );

  /** Initialize draft from a habit object */
  const initializeFromHabit = (habit: Habit) => {
    const values: HabitEditDraft = {
      name: habit.title,
      description: habit.description ?? "",
      icon: habit.icon,
      color: habit.color as HabitColor,
      goal: habit.goal
        ? {
            periodType: habit.goal.periodType,
            targetCount: habit.goal.targetCount,
          }
        : null,
    };

    draft.value = { ...values };
    originalValues.value = { ...values };
  };

  /** Reset draft to default values */
  const resetDraft = () => {
    draft.value = defaultDraft();
    originalValues.value = null;
  };

  /** Computed label for goal display */
  const goalLabel = computed<string>(() => {
    const { goal } = draft.value;

    if (!goal) {
      return "None";
    }

    return formatGoalLabel(goal.periodType, goal.targetCount);
  });

  /** Check if all required fields are filled */
  const isValid = computed(() => {
    const { name, icon, color } = draft.value;
    return name.trim().length > 0 && icon !== null && color !== null;
  });

  /** Check if any values have changed from original */
  const hasChanges = computed(() => {
    if (!originalValues.value) return false;

    const o = originalValues.value;
    const d = draft.value;

    return (
      o.name !== d.name ||
      o.description !== d.description ||
      o.icon !== d.icon ||
      o.color !== d.color ||
      JSON.stringify(o.goal) !== JSON.stringify(d.goal)
    );
  });

  /** Check if goal configuration specifically changed */
  const goalChanged = computed(() => {
    if (!originalValues.value) return false;
    return (
      JSON.stringify(originalValues.value.goal) !==
      JSON.stringify(draft.value.goal)
    );
  });

  return {
    draft,
    originalValues,
    initializeFromHabit,
    resetDraft,
    goalLabel,
    isValid,
    hasChanges,
    goalChanged,
  };
};
