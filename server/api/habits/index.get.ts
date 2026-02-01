/**
 * GET /api/habits
 * Returns all habits for the authenticated user with completions for the specified date range.
 * Query params:
 *   - from: Start date (YYYY-MM-DD), defaults to 365 days ago
 *   - to: End date (YYYY-MM-DD), defaults to today
 */

import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(
  async (event): Promise<HabitsListResponse> => {
    const client = await serverSupabaseClient<Database>(event);
    const user = await serverSupabaseUser(event);

    if (!user?.sub) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    // Parse query params with defaults
    const query = getQuery(event);
    const today = new Date();
    const defaultFrom = new Date(today);
    defaultFrom.setDate(defaultFrom.getDate() - 364); // 365 days including today

    const fromStr =
      typeof query.from === "string"
        ? query.from
        : toISODateString(defaultFrom);
    const toStr =
      typeof query.to === "string" ? query.to : toISODateString(today);

    // Fetch user profile for week_start
    const { data: profile, error: profileError } = await client
      .from("profiles")
      .select("week_start")
      .eq("id", user.sub)
      .single();

    if (profileError) {
      throw createError({
        statusCode: 500,
        message: "Failed to fetch user profile",
      });
    }

    const weekStart = (profile?.week_start ?? 0) as WeekStartDay;

    // Fetch all habits for user
    const { data: habitsData, error: habitsError } = await client
      .from("habits")
      .select("*")
      .eq("user_id", user.sub)
      .order("created_at", { ascending: true });

    if (habitsError) {
      throw createError({ statusCode: 500, message: "Failed to fetch habits" });
    }

    if (!habitsData || habitsData.length === 0) {
      return { habits: [], weekStart };
    }

    // Fetch completions for all habits in the date range
    const habitIds = habitsData.map((h) => h.id);
    const { data: completionsData, error: completionsError } = await client
      .from("completions")
      .select("habit_id, completed_on")
      .in("habit_id", habitIds)
      .gte("completed_on", fromStr)
      .lte("completed_on", toStr);

    if (completionsError) {
      throw createError({
        statusCode: 500,
        message: "Failed to fetch completions",
      });
    }

    // Group completions by habit_id
    const completionsByHabit = new Map<string, Record<string, boolean>>();
    for (const completion of completionsData || []) {
      if (!completionsByHabit.has(completion.habit_id)) {
        completionsByHabit.set(completion.habit_id, {});
      }
      completionsByHabit.get(completion.habit_id)![completion.completed_on] =
        true;
    }

    // Map DB rows to DTOs
    const habits: Habit[] = habitsData.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      icon: row.icon,
      color: row.color,
      streakInterval: row.streak_interval as StreakInterval | null,
      streakCount: row.streak_count,
      currentStreak: row.current_streak,
      bestStreak: row.best_streak,
      lastCompletedOn: row.last_completed_on,
      completions: completionsByHabit.get(row.id) || {},
      createdAt: row.created_at || new Date().toISOString(),
    }));

    return { habits, weekStart };
  },
);
