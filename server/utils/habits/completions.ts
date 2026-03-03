import type { serverSupabaseClient } from "#supabase/server";

import type {
  CompletionBitmapRow,
  CompletionToggleComputationOptions,
  HabitStreak,
} from "~~/server/types/habit";
import type { Database } from "~~/shared/types/database.types";

import { decodeBitmapToCompletionMap } from "~~/server/utils/completions";

import { fetchActiveGoal } from "./queries";
import { computeStreaks } from "./streaks";

type DbClient = Awaited<ReturnType<typeof serverSupabaseClient<Database>>>;

/**
 * Fetches completion bitmap rows for a habit.
 * When `years` is provided, rows are restricted to that list.
 */
export const fetchCompletionRows = async (
  client: DbClient,
  habitId: string,
  years?: number[],
): Promise<CompletionBitmapRow[]> => {
  if (years && years.length === 0) {
    return [];
  }

  let query = client
    .from("completions")
    .select("year, bitmap, week_counts, month_counts")
    .eq("habit_id", habitId);

  if (years && years.length > 0) {
    query = query.in("year", years);
  }

  const { data } = await query;
  const rows = (data ?? []) as CompletionBitmapRow[];

  return rows;
};

/**
 * Decodes completion bitmaps into a date-keyed completion map.
 */
export const decodeCompletionsFromRows = (
  rows: CompletionBitmapRow[],
  fromStr: string,
  toStr: string,
): Record<string, boolean> => {
  const completions: Record<string, boolean> = {};

  for (const row of rows) {
    Object.assign(
      completions,
      decodeBitmapToCompletionMap(row.bitmap, row.year, fromStr, toStr),
    );
  }

  return completions;
};

/**
 * Computes habit streak values for a goal and completion row set.
 */
export const computeHabitStreak = (
  goal: HabitGoalVersion | null,
  rows: CompletionBitmapRow[],
  weekStart: WeekStartDay,
): HabitStreak => {
  if (!goal) {
    return { currentStreak: 0, bestStreak: 0 };
  }

  return computeStreaks(
    rows,
    {
      periodType: goal.periodType,
      targetCount: goal.targetCount,
    },
    weekStart,
  );
};

/**
 * Persists a completion toggle via RPC and returns updated streak values.
 */
export const toggleHabitCompletion = async (
  client: DbClient,
  options: CompletionToggleComputationOptions,
): Promise<CompletionToggleResponse> => {
  const { habitId, date, completed, weekStart } = options;

  const { error: updateError } = await client.rpc("set_habit_completion", {
    p_habit_id: habitId,
    p_date: date,
    p_value: completed ? 1 : 0,
    p_week_start: weekStart,
  });

  if (updateError) {
    throw createError({
      statusCode: 500,
      message: completed
        ? "Failed to add completion"
        : "Failed to delete completion",
    });
  }

  const goal = await fetchActiveGoal(client, habitId);

  if (!goal) {
    return { completed, currentStreak: 0, bestStreak: 0 };
  }

  const rows = await fetchCompletionRows(client, habitId);
  const streak = computeHabitStreak(goal, rows, weekStart);

  return {
    completed,
    currentStreak: streak.currentStreak,
    bestStreak: streak.bestStreak,
  };
};

/**
 * Backward-compatible alias for existing consumers.
 */
export const setHabitCompletionAndComputeStreak = toggleHabitCompletion;
