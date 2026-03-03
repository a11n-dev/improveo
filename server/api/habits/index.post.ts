/**
 * POST /api/habits
 * Create a new habit for the authenticated user.
 * If a goal is provided, also creates a habit_goal_version row.
 */
import { serverSupabaseClient } from "#supabase/server";

import { HabitCreatePayloadSchema } from "~~/shared/validation/habit";

export default defineEventHandler(async (event): Promise<Habit> => {
  const client = await serverSupabaseClient<Database>(event);
  const userId = await requireUserId(event);

  const body = await readValidatedBody(event, HabitCreatePayloadSchema.parse);

  // Insert the habit (metadata only — no streak columns)
  const { data: habit, error } = await client
    .from("habits")
    .insert({
      user_id: userId,
      title: body.title,
      description: body.description?.trim() || null,
      icon: body.icon,
      color: body.color,
    })
    .select()
    .single();

  if (error || !habit) {
    throw createError({
      statusCode: 500,
      message: "Failed to create habit",
    });
  }

  // If a goal is provided, insert a goal version
  let goal: HabitGoalVersion | null = null;
  if (body.goal) {
    const todayStr = toISODateString(new Date());
    const { data: goalRow, error: goalError } = await client
      .from("habit_goal_versions")
      .insert({
        habit_id: habit.id,
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

    goal = mapGoalVersionRowToDto({
      id: goalRow.id,
      period_type: goalRow.period_type,
      target_count: goalRow.target_count,
      effective_from: goalRow.effective_from,
      effective_to: goalRow.effective_to,
    });
  }

  return mapHabitRowToDto(
    {
      id: habit.id,
      title: habit.title,
      description: habit.description,
      icon: habit.icon,
      color: habit.color,
      created_at: habit.created_at,
    },
    goal,
    {},
    { currentStreak: 0, bestStreak: 0 },
  );
});
