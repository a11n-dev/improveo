import type { HabitFormDraft } from "~/types/habit";

/**
 * Maps create-form draft state to API create payload.
 */
export const mapDraftToCreatePayload = (
  draft: HabitFormDraft,
): HabitCreatePayload => {
  return {
    title: draft.name,
    description: draft.description || undefined,
    icon: draft.icon!,
    color: draft.color!,
    goal: draft.goal,
  };
};

/**
 * Maps edit-form draft state to API update payload.
 */
export const mapDraftToUpdatePayload = (
  draft: HabitFormDraft,
): HabitUpdatePayload => {
  return {
    title: draft.name,
    description: draft.description || null,
    icon: draft.icon!,
    color: draft.color!,
    goal: draft.goal,
  };
};
