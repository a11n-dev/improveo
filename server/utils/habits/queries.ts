import type { serverSupabaseClient } from "#supabase/server";

import type { GoalVersionRow, HabitMetadataRow } from "~~/server/types/habit";
import type { Database } from "~~/shared/types/database.types";

import { mapGoalVersionRowToDto } from "./mappers";

type DbClient = Awaited<ReturnType<typeof serverSupabaseClient<Database>>>;

/**
 * Validates that a habit exists and belongs to the authenticated user.
 * Throws 404 when ownership does not match.
 */
export const assertHabitOwnership = async (
  client: DbClient,
  habitId: string,
  userId: string,
): Promise<void> => {
  const { data, error } = await client
    .from("habits")
    .select("id")
    .eq("id", habitId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    throw createError({ statusCode: 404, message: "Habit not found" });
  }
};

/**
 * Fetches a habit metadata row owned by the authenticated user.
 */
export const fetchHabitMetadata = async (
  client: DbClient,
  habitId: string,
  userId: string,
): Promise<HabitMetadataRow> => {
  const { data, error } = await client
    .from("habits")
    .select("id, title, description, icon, color, created_at")
    .eq("id", habitId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error || !data) {
    throw createError({ statusCode: 404, message: "Habit not found" });
  }

  return data;
};

/**
 * Fetches the active goal version for a habit.
 * Returns null when no active goal exists.
 */
export const fetchActiveGoal = async (
  client: DbClient,
  habitId: string,
): Promise<HabitGoalVersion | null> => {
  const { data, error } = await client
    .from("habit_goal_versions")
    .select("id, period_type, target_count, effective_from, effective_to")
    .eq("habit_id", habitId)
    .is("effective_to", null)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapGoalVersionRowToDto(data as GoalVersionRow);
};

/**
 * Backward-compatible alias for existing consumers.
 */
export const fetchActiveGoalVersion = fetchActiveGoal;
