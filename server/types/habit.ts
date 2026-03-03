import type { Tables } from "~~/shared/types/database.types";

/** Minimal habit metadata row fetched from `public.habits`. */
export type HabitMetadataRow = Pick<
  Tables<"habits">,
  "id" | "title" | "description" | "icon" | "color" | "created_at"
>;

/** Active goal row shape fetched from `public.habit_goal_versions`. */
export type GoalVersionRow = Pick<
  Tables<"habit_goal_versions">,
  "id" | "period_type" | "target_count" | "effective_from" | "effective_to"
>;

/** Completion bitmap row shape fetched from `public.completions`. */
export type CompletionBitmapRow = Pick<
  Tables<"completions">,
  "year" | "bitmap" | "week_counts" | "month_counts"
>;

/** Inclusive date range (ISO date strings) used by habits APIs. */
export interface HabitRange {
  fromStr: string;
  toStr: string;
}

/** Computed streak aggregate returned by server utilities. */
export interface HabitStreak {
  currentStreak: number;
  bestStreak: number;
}

/** Input payload for completion toggling + streak recomputation. */
export interface CompletionToggleComputationOptions {
  habitId: string;
  date: string;
  completed: boolean;
  weekStart: WeekStartDay;
}
