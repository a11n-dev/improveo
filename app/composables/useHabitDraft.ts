/** Streak interval options */
export type StreakInterval = "daily" | "weekly" | "monthly";

/** Streak goal: interval + completions per interval */
export interface StreakGoal {
  interval: StreakInterval;
  count: number;
}

/** Draft state for creating a new habit */
export interface HabitDraft {
  name: string;
  description: string;
  icon: string | null;
  color: HabitColor | null;
  streak: StreakGoal | null;
}

/** Default draft state (reset on overlay open) */
const defaultDraft = (): HabitDraft => ({
  name: "",
  description: "",
  icon: null,
  color: null,
  streak: null,
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

  /** Computed label for streak goal display */
  const streakLabel = computed<string>(() => {
    const { streak } = draft.value;

    if (!streak) {
      return "Set streak goal";
    }

    switch (streak.interval) {
      case "daily":
        return "Daily";
      case "weekly":
        return `${streak.count} / Week`;
      case "monthly":
        return `${streak.count} / Month`;
      default:
        return "Set streak goal";
    }
  });

  /** Check if all required fields are filled */
  const isValid = computed(() => {
    const { name, icon, color } = draft.value;
    return name.trim().length > 0 && icon !== null && color !== null;
  });

  return {
    draft,
    resetDraft,
    streakLabel,
    isValid,
  };
};
