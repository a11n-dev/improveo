/**
 * GET /api/habits
 * Returns all habits for the authenticated user with completions for the specified date range.
 * Streaks are computed on-read from packed counters / bitmaps.
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

    // Fetch user settings for week_start (cached)
    const settings = await getUserSettings(event);
    const weekStart = settings.weekStart as WeekStartDay;

    // Fetch all habits for user (metadata only — no streak columns)
    const { data: habitsData, error: habitsError } = await client
      .from("habits")
      .select("id, title, description, icon, color, created_at")
      .eq("user_id", user.sub)
      .order("created_at", { ascending: true });

    if (habitsError) {
      throw createError({ statusCode: 500, message: "Failed to fetch habits" });
    }

    if (!habitsData || habitsData.length === 0) {
      return { habits: [], weekStart };
    }

    const habitIds = habitsData.map((h) => h.id);

    // Fetch current goal versions for all habits (effective_to IS NULL)
    const { data: goalVersions, error: goalError } = await client
      .from("habit_goal_versions")
      .select(
        "id, habit_id, period_type, target_count, effective_from, effective_to",
      )
      .in("habit_id", habitIds)
      .is("effective_to", null);

    if (goalError) {
      throw createError({
        statusCode: 500,
        message: "Failed to fetch goal versions",
      });
    }

    // Index goal versions by habit_id
    const goalByHabit = new Map<string, HabitGoalVersion>();
    for (const gv of goalVersions || []) {
      goalByHabit.set(gv.habit_id, {
        id: gv.id,
        periodType: gv.period_type as PeriodType,
        targetCount: gv.target_count,
        effectiveFrom: gv.effective_from,
        effectiveTo: gv.effective_to,
      });
    }

    // Determine years to fetch completions for
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

    // Fetch completions with bitmap + packed counters
    const { data: completionsData, error: completionsError } = await client
      .from("completions")
      .select("habit_id, year, bitmap, week_counts, month_counts")
      .in("habit_id", habitIds)
      .in("year", years);

    if (completionsError) {
      throw createError({
        statusCode: 500,
        message: "Failed to fetch completions",
      });
    }

    // Group completions by habit_id
    const completionsByHabit = new Map<string, Record<string, boolean>>();
    const completionRowsByHabit = new Map<string, CompletionBitmapRow[]>();

    for (const completion of completionsData || []) {
      // Build date map for UI
      if (!completionsByHabit.has(completion.habit_id)) {
        completionsByHabit.set(completion.habit_id, {});
      }
      const existing = completionsByHabit.get(completion.habit_id)!;
      const decoded = decodeBitmapToCompletionMap(
        completion.bitmap,
        completion.year,
        fromStr,
        toStr,
      );
      Object.assign(existing, decoded);

      // Store rows for streak calculation
      if (!completionRowsByHabit.has(completion.habit_id)) {
        completionRowsByHabit.set(completion.habit_id, []);
      }
      completionRowsByHabit.get(completion.habit_id)!.push({
        year: completion.year,
        bitmap: completion.bitmap,
        week_counts: completion.week_counts,
        month_counts: completion.month_counts,
      });
    }

    // Map DB rows to DTOs with computed streaks
    const habits: Habit[] = habitsData.map((row) => {
      const goal = goalByHabit.get(row.id) ?? null;
      const completionRows = completionRowsByHabit.get(row.id) ?? [];

      // Compute streaks only if a goal is set
      let currentStreak = 0;
      let bestStreak = 0;
      if (goal) {
        const streakResult = computeStreaks(
          completionRows,
          { periodType: goal.periodType, targetCount: goal.targetCount },
          weekStart,
        );
        currentStreak = streakResult.currentStreak;
        bestStreak = streakResult.bestStreak;
      }

      return {
        id: row.id,
        title: row.title,
        description: row.description,
        icon: row.icon,
        color: row.color,
        goal,
        currentStreak,
        bestStreak,
        completions: completionsByHabit.get(row.id) || {},
        createdAt: row.created_at || new Date().toISOString(),
      };
    });

    return { habits, weekStart };
  },
);
