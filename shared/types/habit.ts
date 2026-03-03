import type {
  Enums,
  Tables,
  TablesInsert,
  TablesUpdate,
} from "./database.types";

/**
 * Shared habit types used by both client and server.
 * DTO keys stay camelCase while primitive field types come from Supabase.
 */

/** Goal period values sourced from the `goal_period_type` enum. */
export type PeriodType = Enums<"goal_period_type">;

/**
 * Week start day constrained to app-level ISO indexing.
 * 0 = Monday, 1 = Tuesday, ..., 6 = Sunday.
 */
export type WeekStartDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Goal payload used by create/update forms and APIs. */
export interface Goal {
  periodType: PeriodType;
  targetCount: Tables<"habit_goal_versions">["target_count"];
}

/** Goal version DTO derived from `habit_goal_versions`. */
export interface HabitGoalVersion {
  id: Tables<"habit_goal_versions">["id"];
  periodType: PeriodType;
  targetCount: Tables<"habit_goal_versions">["target_count"];
  effectiveFrom: Tables<"habit_goal_versions">["effective_from"];
  effectiveTo: Tables<"habit_goal_versions">["effective_to"];
}

/**
 * Habit DTO for client consumption.
 * Maps from DB rows + derived completion/streak fields.
 */
export interface Habit {
  id: Tables<"habits">["id"];
  title: Tables<"habits">["title"];
  description: Tables<"habits">["description"];
  icon: Tables<"habits">["icon"];
  color: Tables<"habits">["color"];
  goal: HabitGoalVersion | null;
  currentStreak: number;
  bestStreak: number;
  completions: Record<string, boolean>;
  createdAt: NonNullable<Tables<"habits">["created_at"]>;
}

/** Payload for creating a new habit. */
export interface HabitCreatePayload {
  title: TablesInsert<"habits">["title"];
  description?: Exclude<TablesInsert<"habits">["description"], null>;
  icon: TablesInsert<"habits">["icon"];
  color: TablesInsert<"habits">["color"];
  goal: Goal | null;
}

/**
 * Payload for updating an existing habit.
 * All fields are optional - only send changed fields.
 */
export interface HabitUpdatePayload {
  title?: TablesUpdate<"habits">["title"];
  description?: TablesUpdate<"habits">["description"];
  icon?: TablesUpdate<"habits">["icon"];
  color?: TablesUpdate<"habits">["color"];
  goal?: Goal | null;
}

/** Response from completion toggle API. */
export interface CompletionToggleResponse {
  completed: boolean;
  currentStreak: number;
  bestStreak: number;
}

/** Response shape for the habits list API. */
export interface HabitsListResponse {
  habits: Habit[];
  weekStart: WeekStartDay;
}
