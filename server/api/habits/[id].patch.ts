/**
 * PATCH /api/habits/:id
 * Update an existing habit for the authenticated user.
 * Handles goal version transitions when the goal changes.
 */
import { serverSupabaseClient } from "#supabase/server";

import { HabitIdParamsSchema } from "~~/server/validation/habits";
import { HabitUpdatePayloadSchema } from "~~/shared/validation/habit";

export default defineEventHandler(async (event): Promise<Habit> => {
  const client = await serverSupabaseClient<Database>(event);
  const userId = await requireUserId(event);
  const { id: habitId } = await getValidatedRouterParams(
    event,
    HabitIdParamsSchema.parse,
  );

  await fetchHabitMetadata(client, habitId, userId);

  const body = await readValidatedBody(event, HabitUpdatePayloadSchema.parse);

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
    .eq("user_id", userId)
    .select()
    .single();

  if (updateError || !updatedHabit) {
    throw createError({
      statusCode: 500,
      message: "Failed to update habit",
    });
  }

  let currentGoal: HabitGoalVersion | null = null;

  if (body.goal !== undefined) {
    const todayStr = toISODateString(new Date());

    await client
      .from("habit_goal_versions")
      .update({ effective_to: todayStr })
      .eq("habit_id", habitId)
      .is("effective_to", null);

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
        .select("id, period_type, target_count, effective_from, effective_to")
        .single();

      if (goalError || !goalRow) {
        throw createError({
          statusCode: 500,
          message: "Failed to create goal version",
        });
      }

      currentGoal = mapGoalVersionRowToDto({
        id: goalRow.id,
        period_type: goalRow.period_type,
        target_count: goalRow.target_count,
        effective_from: goalRow.effective_from,
        effective_to: goalRow.effective_to,
      });
    }
  } else {
    currentGoal = await fetchActiveGoalVersion(client, habitId);
  }

  const settings = await getUserSettings(event, userId);
  const weekStart = settings.weekStart as WeekStartDay;

  const { fromStr, toStr } = getDefaultHabitRange();
  const years = getYearsInRange(fromStr, toStr);
  const completionRows = await fetchCompletionRows(client, habitId, years);
  const completions = decodeCompletionsFromRows(completionRows, fromStr, toStr);
  const streak = computeHabitStreak(currentGoal, completionRows, weekStart);

  return mapHabitRowToDto(
    {
      id: updatedHabit.id,
      title: updatedHabit.title,
      description: updatedHabit.description,
      icon: updatedHabit.icon,
      color: updatedHabit.color,
      created_at: updatedHabit.created_at,
    },
    currentGoal,
    completions,
    streak,
  );
});
