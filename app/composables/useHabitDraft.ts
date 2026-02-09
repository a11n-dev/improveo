/** Draft state for creating a new habit */
export interface HabitDraft {
  name: string;
  description: string;
  icon: string | null;
  color: HabitColor | null;
  goal: Goal | null;
}

/** Default draft state (reset on overlay open) */
const defaultDraft = (): HabitDraft => ({
  name: "",
  description: "",
  icon: null,
  color: null,
  goal: null,
});

/**
 * Composable for managing habit creation draft state.
 * Shared across overlay and form components.
 */
export const useHabitDraft = () => {
  const draft = useState<HabitDraft>("habit-create-draft", defaultDraft);

  /** Reset draft to default values */
  const resetDraft = () => {
    draft.value = defaultDraft();
  };

  /** Computed label for goal display */
  const goalLabel = computed<string>(() => {
    const { goal } = draft.value;

    if (!goal) {
      return "None";
    }

    return formatGoalLabel(goal.periodType, goal.targetCount);
  });

  /** Check if all required fields are filled (goal is optional) */
  const isValid = computed(() => {
    const { name, icon, color } = draft.value;
    return name.trim().length > 0 && icon !== null && color !== null;
  });

  return {
    draft,
    resetDraft,
    goalLabel,
    isValid,
  };
};
