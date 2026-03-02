import type { HabitFormDraft } from "~/types/habit";

/** Creates a fresh empty draft for habit create/edit flows. */
export const createHabitDraft = (): HabitFormDraft => ({
  name: "",
  description: "",
  icon: null,
  color: null,
  goal: null,
});

/** Returns a safe draft clone to avoid mutating source references. */
export const cloneHabitDraft = (source: HabitFormDraft): HabitFormDraft => ({
  ...source,
  goal: source.goal ? { ...source.goal } : null,
});

/** Maps a persisted habit DTO into editable draft form state. */
export const mapHabitToDraft = (source: Habit): HabitFormDraft => ({
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

/** Compares two goal payloads for semantic equality. */
export const isGoalEqual = (left: Goal | null, right: Goal | null): boolean => {
  if (!left || !right) {
    return left === right;
  }

  return (
    left.periodType === right.periodType &&
    left.targetCount === right.targetCount
  );
};

/** Checks required draft fields before create/save actions are enabled. */
export const isHabitDraftValid = (draft: HabitFormDraft): boolean => {
  return (
    draft.name.trim().length > 0 && draft.icon !== null && draft.color !== null
  );
};

/** Returns a user-facing goal label for the current draft state. */
export const getGoalLabel = (goal: Goal | null): string => {
  if (!goal) {
    return "None";
  }

  return formatGoalLabel(goal.periodType, goal.targetCount);
};
