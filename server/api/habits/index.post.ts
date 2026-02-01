/**
 * POST /api/habits
 * Create a new habit for the authenticated user.
 */
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event): Promise<Habit> => {
  const client = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);

  if (!user?.sub) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  // Parse and validate body
  const body = await readBody<HabitCreatePayload>(event);

  if (!body.title?.trim()) {
    throw createError({ statusCode: 400, message: "Title is required" });
  }

  if (!body.icon?.trim()) {
    throw createError({ statusCode: 400, message: "Icon is required" });
  }

  if (!body.color?.trim()) {
    throw createError({ statusCode: 400, message: "Color is required" });
  }

  const validIntervals: StreakInterval[] = ["daily", "weekly", "monthly"];

  // streakInterval can be null (no streak tracking) or a valid interval
  if (
    body.streakInterval !== null &&
    !validIntervals.includes(body.streakInterval)
  ) {
    throw createError({
      statusCode: 400,
      message:
        "Invalid streak interval. Must be null, daily, weekly, or monthly",
    });
  }

  // streakCount must be 0 when interval is null, or >= 1 when interval is set
  if (body.streakInterval === null) {
    if (body.streakCount !== 0) {
      throw createError({
        statusCode: 400,
        message: "Streak count must be 0 when streak interval is disabled",
      });
    }
  } else {
    if (typeof body.streakCount !== "number" || body.streakCount < 1) {
      throw createError({
        statusCode: 400,
        message: "Streak count must be a positive integer",
      });
    }
  }

  // Insert the habit
  const { data: habit, error } = await client
    .from("habits")
    .insert({
      user_id: user.sub,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      icon: body.icon.trim(),
      color: body.color.trim(),
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
