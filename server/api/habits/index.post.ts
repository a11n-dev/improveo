/**
 * POST /api/habits
 * Create a new habit for the authenticated user.
 * If a goal is provided, also creates a habit_goal_version row.
 */
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

import { parseBody } from "~~/server/utils/validate";
import { HabitCreatePayloadSchema } from "~~/shared/validation/habit";

export default defineEventHandler(async (event): Promise<Habit> => {
  const client = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);

  if (!user?.sub) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // Parse and validate body
  const body = await parseBody(event, HabitCreatePayloadSchema);

  // Insert the habit (metadata only — no streak columns)
  const { data: habit, error } = await client
    .from("habits")
    .insert({
      user_id: user.sub,
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

    goal = {
      id: goalRow.id,
      periodType: goalRow.period_type as PeriodType,
      targetCount: goalRow.target_count,
      effectiveFrom: goalRow.effective_from,
      effectiveTo: goalRow.effective_to,
    };
  }

  // Return DTO with empty completions and zero streaks
  return {
    id: habit.id,
    title: habit.title,
    description: habit.description,
    icon: habit.icon,
    color: habit.color,
    goal,
    currentStreak: 0,
    bestStreak: 0,
    completions: {},
    createdAt: habit.created_at || new Date().toISOString(),
  };
});
