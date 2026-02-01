/**
 * DELETE /api/habits/:id/completions
 * Remove a completion for a habit.
 * Query param: date=YYYY-MM-DD
 * Recomputes streaks after delete.
 */
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(
  async (event): Promise<CompletionToggleResponse> => {
    const client = await serverSupabaseClient<Database>(event);
    const user = await serverSupabaseUser(event);

    if (!user?.sub) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const habitId = getRouterParam(event, "id");

    if (!habitId) {
      throw createError({ statusCode: 400, message: "Habit ID is required" });
    }

    const query = getQuery(event);
    const date = query.date;
    if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw createError({
        statusCode: 400,
        message: "Valid date query param (YYYY-MM-DD) is required",
      });
    }

    // Verify habit exists and belongs to user
    const { data: habit, error: habitError } = await client
      .from("habits")
      .select("id, streak_interval, streak_count")
      .eq("id", habitId)
      .eq("user_id", user.sub)
      .single();

    if (habitError || !habit) {
      throw createError({ statusCode: 404, message: "Habit not found" });
    }

    // Get user's week_start setting
    const { data: profile } = await client
      .from("profiles")
      .select("week_start")
      .eq("id", user.sub)
      .single();

    const weekStart = (profile?.week_start ?? 0) as WeekStartDay;

    // Delete the completion
    const { error: deleteError } = await client
      .from("completions")
      .delete()
      .eq("habit_id", habitId)
      .eq("user_id", user.sub)
      .eq("completed_on", date);

    if (deleteError) {
      throw createError({
        statusCode: 500,
        message: "Failed to delete completion",
      });
    }

    // Fetch remaining completions for this habit to recompute streaks
    const { data: allCompletions, error: fetchError } = await client
      .from("completions")
      .select("completed_on")
      .eq("habit_id", habitId);

    if (fetchError) {
      throw createError({
        statusCode: 500,
        message: "Failed to fetch completions for streak calculation",
      });
    }

    // Compute streaks
    const streakResult = computeStreaks(
      allCompletions || [],
      {
        streakInterval: habit.streak_interval as StreakInterval | null,
        streakCount: habit.streak_count,
      },
      weekStart,
    );

    // Update habit with new streak values
    const { error: updateError } = await client
      .from("habits")
      .update({
        current_streak: streakResult.currentStreak,
        best_streak: streakResult.bestStreak,
        last_completed_on: streakResult.lastCompletedOn,
        updated_at: new Date().toISOString(),
      })
      .eq("id", habitId);

    if (updateError) {
      throw createError({
        statusCode: 500,
        message: "Failed to update streak values",
      });
    }

    return {
      completed: false,
      currentStreak: streakResult.currentStreak,
      bestStreak: streakResult.bestStreak,
      lastCompletedOn: streakResult.lastCompletedOn,
    };
  },
);
