import type { HabitFormDraft } from "~/types/habit-form";

export const createHabitDraft = (): HabitFormDraft => ({
  name: "",
  description: "",
  icon: null,
  color: null,
  goal: null,
});

export const cloneHabitDraft = (source: HabitFormDraft): HabitFormDraft => ({
  ...source,
  goal: source.goal ? { ...source.goal } : null,
});

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

export const isGoalEqual = (left: Goal | null, right: Goal | null): boolean => {
  if (!left || !right) {
    return left === right;
  }

  return (
    left.periodType === right.periodType &&
    left.targetCount === right.targetCount
  );
};

export const isHabitDraftValid = (draft: HabitFormDraft): boolean => {
  return (
    draft.name.trim().length > 0 && draft.icon !== null && draft.color !== null
  );
};

export const getGoalLabel = (goal: Goal | null): string => {
  if (!goal) {
    return "None";
  }

  return formatGoalLabel(goal.periodType, goal.targetCount);
};
