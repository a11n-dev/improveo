/**
 * Shared habit types used by both client and server.
 * These DTOs decouple the client from the database schema.
 */

/** Streak interval options for habits with streak tracking */
export type StreakInterval = "daily" | "weekly" | "monthly";

/** Week start day (0 = Monday, 1 = Tuesday, ..., 6 = Sunday) - ISO 8601 standard */
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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
  /** null means no streak tracking */
  streakInterval: StreakInterval | null;
  /** 0 when streakInterval is null */
  streakCount: number;
  currentStreak: number;
  bestStreak: number;
  lastCompletedOn: string | null;
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
  /** null means no streak tracking */
  streakInterval: StreakInterval | null;
  /** 0 when streakInterval is null */
  streakCount: number;
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
 * Contains updated streak information.
 */
export interface CompletionToggleResponse {
  completed: boolean;
  currentStreak: number;
  bestStreak: number;
  lastCompletedOn: string | null;
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
