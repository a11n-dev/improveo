import type {
  GoalVersionRow,
  HabitMetadataRow,
  HabitStreak,
} from "~~/server/types/habit";

/** Maps an active goal row from database shape to shared DTO shape. */
export const mapGoalVersionRowToDto = (
  row: GoalVersionRow,
): HabitGoalVersion => {
  return {
    id: row.id,
    periodType: row.period_type,
    targetCount: row.target_count,
    effectiveFrom: row.effective_from,
    effectiveTo: row.effective_to,
  };
};

/**
 * Creates a full Habit DTO from database metadata and computed values.
 */
export const mapHabitRowToDto = (
  row: HabitMetadataRow,
  goal: HabitGoalVersion | null,
  completions: Record<string, boolean>,
  streak: HabitStreak,
): Habit => {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    icon: row.icon,
    color: row.color,
    goal,
    currentStreak: streak.currentStreak,
    bestStreak: streak.bestStreak,
    completions,
    createdAt: row.created_at ?? new Date().toISOString(),
  };
};
