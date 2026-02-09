/**
 * Shared habit types used by both client and server.
 * These DTOs decouple the client from the database schema.
 */

/** Period type for goal tracking */
export type PeriodType = "day" | "week" | "month";

/** Week start day (0 = Monday, 1 = Tuesday, ..., 6 = Sunday) - ISO 8601 standard */
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Goal: period type + target completions per period */
export interface Goal {
  periodType: PeriodType;
  targetCount: number;
}

/** Goal version from the habit_goal_versions table */
export interface HabitGoalVersion {
  id: string;
  periodType: PeriodType;
  targetCount: number;
  effectiveFrom: string;
  effectiveTo: string | null;
}

/**
 * Habit DTO for client consumption.
 * Maps from DB row + completions to a client-friendly shape.
 */
export interface Habit {
  id: string;
  title: string;
  description: string | null;
  icon: string;
  color: string;
  /** Current active goal, or null if no goal tracking */
  goal: HabitGoalVersion | null;
  /** Current streak count (computed on read from packed counters) */
  currentStreak: number;
  /** Best streak count (computed on read from packed counters) */
  bestStreak: number;
  /** Completion map: date (YYYY-MM-DD) -> completed */
  completions: Record<string, boolean>;
  createdAt: string;
}

/**
 * Payload for creating a new habit.
 */
export interface HabitCreatePayload {
  title: string;
  description?: string;
  icon: string;
  color: string;
  /** null means no goal tracking */
  goal: Goal | null;
}

/**
 * Payload for updating an existing habit.
 * All fields are optional - only send changed fields.
 */
export interface HabitUpdatePayload {
  title?: string;
  description?: string | null;
  icon?: string;
  color?: string;
  /** null means no goal tracking; undefined means unchanged */
  goal?: Goal | null;
}

/**
 * Payload for toggling a completion.
 */
export interface CompletionTogglePayload {
  habitId: string;
  date: string; // YYYY-MM-DD
}

/**
 * Response from completion toggle API.
 */
export interface CompletionToggleResponse {
  completed: boolean;
  currentStreak: number;
  bestStreak: number;
}

/**
 * Response shape for the habits list API.
 */
export interface HabitsListResponse {
  habits: Habit[];
  weekStart: WeekStartDay;
}

/**
 * Query parameters for fetching habits.
 */
export interface HabitsQueryParams {
  from?: string; // YYYY-MM-DD
  to?: string; // YYYY-MM-DD
}
