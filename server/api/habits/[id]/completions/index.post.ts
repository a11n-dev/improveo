/**
 * POST /api/habits/:id/completions
 * Add a completion for a habit.
 * Body: { date: "YYYY-MM-DD" }
 * Calls the set_habit_completion RPC (fire-and-forget for streaks).
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

    const body = await readBody<{ date: string }>(event);
    if (!body.date || !/^\d{4}-\d{2}-\d{2}$/.test(body.date)) {
      throw createError({
        statusCode: 400,
        message: "Valid date (YYYY-MM-DD) is required",
      });
    }

    // Verify habit exists and belongs to user
    const { data: habit, error: habitError } = await client
      .from("habits")
      .select("id")
      .eq("id", habitId)
      .eq("user_id", user.sub)
      .single();

    if (habitError || !habit) {
      throw createError({ statusCode: 404, message: "Habit not found" });
    }

    // Get user's week_start setting for the RPC
    const { data: profile } = await client
      .from("profiles")
      .select("week_start")
      .eq("id", user.sub)
      .single();

    const weekStart = (profile?.week_start ?? 0) as WeekStartDay;

    // Update completion bitmap via RPC (new signature: no p_user_id, add p_week_start)
    const { error: updateError } = await client.rpc("set_habit_completion", {
      p_habit_id: habitId,
      p_date: body.date,
      p_value: 1,
      p_week_start: weekStart,
    });

    if (updateError) {
      throw createError({
        statusCode: 500,
        message: "Failed to add completion",
      });
    }

    // Fetch current goal version to compute streaks
    const { data: goalVersion } = await client
      .from("habit_goal_versions")
      .select("period_type, target_count")
      .eq("habit_id", habitId)
      .is("effective_to", null)
      .single();

    if (!goalVersion) {
      return { completed: true, currentStreak: 0, bestStreak: 0 };
    }

    // Fetch all completion rows for this habit to compute streaks
    const { data: completionRows } = await client
      .from("completions")
      .select("year, bitmap, week_counts, month_counts")
      .eq("habit_id", habitId);

    const rows: CompletionBitmapRow[] = (completionRows ?? []).map((r) => ({
      year: r.year,
      bitmap: r.bitmap,
      week_counts: r.week_counts,
      month_counts: r.month_counts,
    }));

    const { currentStreak, bestStreak } = computeStreaks(
      rows,
      {
        periodType: goalVersion.period_type as PeriodType,
        targetCount: goalVersion.target_count,
      },
      weekStart,
    );

    return { completed: true, currentStreak, bestStreak };
  },
);
