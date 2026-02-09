/**
 * PATCH /api/habits/:id
 * Update an existing habit for the authenticated user.
 * Handles goal version transitions when the goal changes.
 */
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

import { parseBody } from "~~/server/utils/validate";
import { HabitUpdatePayloadSchema } from "~~/shared/validation/habit";

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
    .select("id, title, description, icon, color, created_at")
    .eq("id", habitId)
    .eq("user_id", user.sub)
    .single();

  if (habitError || !existingHabit) {
    throw createError({ statusCode: 404, message: "Habit not found" });
  }

  // Parse and validate body
  const body = await parseBody(event, HabitUpdatePayloadSchema);

  // Build update object with only provided metadata fields
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

  // Perform the habit metadata update
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

  // Handle goal changes if goal was provided in the body
  let currentGoal: HabitGoalVersion | null = null;
  const todayStr = toISODateString(new Date());

  if (body.goal !== undefined) {
    // Close the current active goal version (if any)
    await client
      .from("habit_goal_versions")
      .update({ effective_to: todayStr })
      .eq("habit_id", habitId)
      .is("effective_to", null);

    // Insert new goal version if goal is non-null
    if (body.goal !== null) {
      const { data: goalRow, error: goalError } = await client
        .from("habit_goal_versions")
        .insert({
          habit_id: habitId,
          period_type: body.goal.periodType,
          target_count: body.goal.targetCount,
          effective_from: todayStr,
          effective_to: null,
        })
        .select()
        .single();

      if (goalError || !goalRow) {
        throw createError({
          statusCode: 500,
          message: "Failed to create goal version",
        });
      }

      currentGoal = {
        id: goalRow.id,
        periodType: goalRow.period_type as PeriodType,
        targetCount: goalRow.target_count,
        effectiveFrom: goalRow.effective_from,
        effectiveTo: goalRow.effective_to,
      };
    }
  } else {
    // goal not in payload — fetch current goal version
    const { data: goalRows } = await client
      .from("habit_goal_versions")
      .select("id, period_type, target_count, effective_from, effective_to")
      .eq("habit_id", habitId)
      .is("effective_to", null)
      .limit(1);

    if (goalRows && goalRows.length > 0) {
      const gv = goalRows[0]!;
      currentGoal = {
        id: gv.id,
        periodType: gv.period_type as PeriodType,
        targetCount: gv.target_count,
        effectiveFrom: gv.effective_from,
        effectiveTo: gv.effective_to,
      };
    }
  }

  // Fetch user settings for week_start (cached, needed for streak computation)
  const settings = await getUserSettings(event);
  const weekStart = settings.weekStart as WeekStartDay;

  // Fetch completions for the response (same range as GET /api/habits)
  const today = new Date();
  const defaultFrom = new Date(today);
  defaultFrom.setDate(defaultFrom.getDate() - 364);
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
    .select("year, bitmap, week_counts, month_counts")
    .eq("habit_id", habitId)
    .in("year", years);

  // Decode completions into date map
  const completions: Record<string, boolean> = {};
  const bitmapRows: CompletionBitmapRow[] = [];
  for (const row of completionRows || []) {
    const decoded = decodeBitmapToCompletionMap(
      row.bitmap,
      row.year,
      fromStr,
      toStr,
    );
    Object.assign(completions, decoded);
    bitmapRows.push({
      year: row.year,
      bitmap: row.bitmap,
      week_counts: row.week_counts,
      month_counts: row.month_counts,
    });
  }

  // Compute streaks if a goal is set
  let currentStreak = 0;
  let bestStreak = 0;
  if (currentGoal) {
    const streakResult = computeStreaks(
      bitmapRows,
      {
        periodType: currentGoal.periodType,
        targetCount: currentGoal.targetCount,
      },
      weekStart,
    );
    currentStreak = streakResult.currentStreak;
    bestStreak = streakResult.bestStreak;
  }

  // Return full DTO
  return {
    id: updatedHabit.id,
    title: updatedHabit.title,
    description: updatedHabit.description,
    icon: updatedHabit.icon,
    color: updatedHabit.color,
    goal: currentGoal,
    currentStreak,
    bestStreak,
    completions,
    createdAt: updatedHabit.created_at || new Date().toISOString(),
  };
});
