/**
 * PATCH /api/habits/:id
 * Update an existing habit for the authenticated user.
 * Recalculates streaks if streak configuration changes.
 */
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

import { parseBody } from "~~/server/utils/validate";
import {
  HabitStreakSchema,
  HabitUpdatePayloadSchema,
} from "~~/shared/validation/habit";

export default defineEventHandler(async (event): Promise<Habit> => {
  const client = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);

  if (!user?.sub) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const habitId = getRouterParam(event, "id");

  if (!habitId) {
    throw createError({ statusCode: 400, message: "Habit ID is required" });
  }

  // Verify habit exists and belongs to user
  const { data: existingHabit, error: habitError } = await client
    .from("habits")
    .select("*")
    .eq("id", habitId)
    .eq("user_id", user.sub)
    .single();

  if (habitError || !existingHabit) {
    throw createError({ statusCode: 404, message: "Habit not found" });
  }

  // Parse and validate body
  const body = await parseBody(event, HabitUpdatePayloadSchema);

  // Determine the final streak configuration
  const finalStreakInterval = (
    body.streakInterval !== undefined
      ? body.streakInterval
      : existingHabit.streak_interval
  ) as StreakInterval | null;
  const finalStreakCount =
    body.streakCount !== undefined
      ? body.streakCount
      : existingHabit.streak_count;

  const streakValidation = HabitStreakSchema.safeParse({
    streakInterval: finalStreakInterval,
    streakCount: finalStreakCount,
  });

  if (!streakValidation.success) {
    const issue = streakValidation.error.issues[0];
    throw createError({
      statusCode: 400,
      message: issue?.message ?? "Invalid streak configuration",
    });
  }

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (body.title !== undefined) {
    updateData.title = body.title;
  }
  if (body.description !== undefined) {
    updateData.description = body.description?.trim() || null;
  }
  if (body.icon !== undefined) {
    updateData.icon = body.icon;
  }
  if (body.color !== undefined) {
    updateData.color = body.color;
  }
  if (body.streakInterval !== undefined) {
    updateData.streak_interval = body.streakInterval;
  }
  if (body.streakCount !== undefined) {
    updateData.streak_count = body.streakCount;
  }

  // Check if streak configuration changed - need to recalculate streaks
  const streakConfigChanged =
    body.streakInterval !== undefined || body.streakCount !== undefined;

  if (streakConfigChanged) {
    // Get user's week_start setting
    const { data: profile } = await client
      .from("profiles")
      .select("week_start")
      .eq("id", user.sub)
      .single();

    const weekStart = (profile?.week_start ?? 0) as WeekStartDay;

    // Fetch all completions for this habit to recompute streaks
    const { data: completionRows, error: fetchError } = await client
      .from("completions")
      .select("year, bitmap")
      .eq("habit_id", habitId)
      .eq("user_id", user.sub);

    if (fetchError) {
      throw createError({
        statusCode: 500,
        message: "Failed to fetch completions for streak calculation",
      });
    }

    // Compute streaks with the new configuration
    const allCompletions = decodeCompletionRowsToRecords(completionRows || []);

    const streakResult = computeStreaks(
      allCompletions,
      {
        streakInterval: finalStreakInterval as StreakInterval | null,
        streakCount: finalStreakCount,
      },
      weekStart,
    );

    // Include recalculated streak values in the update
    updateData.current_streak = streakResult.currentStreak;
    updateData.best_streak = streakResult.bestStreak;
    updateData.last_completed_on = streakResult.lastCompletedOn;
  }

  // Perform the update
  const { data: updatedHabit, error: updateError } = await client
    .from("habits")
    .update(updateData)
    .eq("id", habitId)
    .eq("user_id", user.sub)
    .select()
    .single();

  if (updateError || !updatedHabit) {
    throw createError({
      statusCode: 500,
      message: "Failed to update habit",
    });
  }

  // Fetch completions for the response (same range as GET /api/habits)
  const today = new Date();
  const defaultFrom = new Date(today);
  defaultFrom.setDate(defaultFrom.getDate() - 364); // 365 days including today
  const fromStr = toISODateString(defaultFrom);
  const toStr = toISODateString(today);

  const fromDate = parseISODateString(fromStr);
  const toDate = parseISODateString(toStr);
  const years: number[] = [];
  for (
    let year = fromDate.getFullYear();
    year <= toDate.getFullYear();
    year++
  ) {
    years.push(year);
  }

  const { data: completionRows } = await client
    .from("completions")
    .select("year, bitmap")
    .eq("habit_id", habitId)
    .eq("user_id", user.sub)
    .in("year", years);

  // Decode completions into date map
  const completions: Record<string, boolean> = {};
  for (const row of completionRows || []) {
    const decoded = decodeBitmapToCompletionMap(
      row.bitmap,
      row.year,
      fromStr,
      toStr,
    );
    Object.assign(completions, decoded);
  }

  // Return full DTO
  return {
    id: updatedHabit.id,
    title: updatedHabit.title,
    description: updatedHabit.description,
    icon: updatedHabit.icon,
    color: updatedHabit.color,
    streakInterval: updatedHabit.streak_interval as StreakInterval | null,
    streakCount: updatedHabit.streak_count,
    currentStreak: updatedHabit.current_streak,
    bestStreak: updatedHabit.best_streak,
    lastCompletedOn: updatedHabit.last_completed_on,
    completions,
    createdAt: updatedHabit.created_at || new Date().toISOString(),
  };
});
