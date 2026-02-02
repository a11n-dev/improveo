/** Draft state for editing a habit */
export interface HabitEditDraft {
  name: string;
  description: string;
  icon: string | null;
  color: HabitColor | null;
  streak: StreakGoal | null;
}

/** Original values from when edit started (for change detection) */
interface OriginalValues {
  name: string;
  description: string;
  icon: string | null;
  color: HabitColor | null;
  streak: StreakGoal | null;
}

/** Default empty draft state */
const defaultDraft = (): HabitEditDraft => ({
  name: "",
  description: "",
  icon: null,
  color: null,
  streak: null,
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
      streak: habit.streakInterval
        ? { interval: habit.streakInterval, count: habit.streakCount }
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

  /** Computed label for streak goal display */
  const streakLabel = computed<string>(() => {
    const { streak } = draft.value;

    if (!streak) {
      return "None";
    }

    switch (streak.interval) {
      case "daily":
        return "Daily";
      case "weekly":
        return `${streak.count} / Week`;
      case "monthly":
        return `${streak.count} / Month`;
      default:
        return "None";
    }
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
      JSON.stringify(o.streak) !== JSON.stringify(d.streak)
    );
  });

  /** Check if streak configuration specifically changed */
  const streakChanged = computed(() => {
    if (!originalValues.value) return false;
    return (
      JSON.stringify(originalValues.value.streak) !==
      JSON.stringify(draft.value.streak)
    );
  });

  return {
    draft,
    originalValues,
    initializeFromHabit,
    resetDraft,
    streakLabel,
    isValid,
    hasChanges,
    streakChanged,
  };
};
