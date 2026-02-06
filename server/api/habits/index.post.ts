/**
 * POST /api/habits
 * Create a new habit for the authenticated user.
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

  // Insert the habit
  const { data: habit, error } = await client
    .from("habits")
    .insert({
      user_id: user.sub,
      title: body.title,
      description: body.description?.trim() || null,
      icon: body.icon,
      color: body.color,
      streak_interval: body.streakInterval,
      streak_count: body.streakCount,
    })
    .select()
    .single();

  if (error || !habit) {
    throw createError({
      statusCode: 500,
      message: "Failed to create habit",
    });
  }

  // Return DTO with empty completions
  return {
    id: habit.id,
    title: habit.title,
    description: habit.description,
    icon: habit.icon,
    color: habit.color,
    streakInterval: habit.streak_interval as StreakInterval | null,
    streakCount: habit.streak_count,
    currentStreak: habit.current_streak,
    bestStreak: habit.best_streak,
    lastCompletedOn: habit.last_completed_on,
    completions: {},
    createdAt: habit.created_at || new Date().toISOString(),
  };
});
