/**
 * GET /api/habits
 * Returns all habits for the authenticated user with completions for the
 * specified date range.
 *
 * Data is fetched through a single RPC (`get_habits_overview`) that joins
 * habits, active goal versions, and completion bitmaps. Streaks are still
 * computed in the API layer from packed counters/bitmaps.
 * Query params:
 *   - from: Start date (YYYY-MM-DD), defaults to 365 days ago
 *   - to: End date (YYYY-MM-DD), defaults to today
 */

import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

type HabitsOverviewRow =
  Database["public"]["Functions"]["get_habits_overview"]["Returns"][number];

const HABITS_OVERVIEW_RPC = "get_habits_overview";

interface HabitAggregate {
  habit: Habit;
  completionRows: CompletionBitmapRow[];
}

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

    const [settings, overviewResult] = await Promise.all([
      getUserSettings(event),
      client.rpc(HABITS_OVERVIEW_RPC, {
        p_from: fromStr,
        p_to: toStr,
      }),
    ]);

    const weekStart = settings.weekStart as WeekStartDay;
    const { data: overviewRows, error: overviewError } = overviewResult;

    if (overviewError) {
      throw createError({
        statusCode: 500,
        message: "Failed to fetch habits overview",
      });
    }

    if (!overviewRows || overviewRows.length === 0) {
      return { habits: [], weekStart };
    }

    const habitsById = new Map<string, HabitAggregate>();

    for (const row of overviewRows as HabitsOverviewRow[]) {
      const aggregate = habitsById.get(row.habit_id);

      if (!aggregate) {
        habitsById.set(row.habit_id, {
          habit: {
            id: row.habit_id,
            title: row.title,
            description: row.description,
            icon: row.icon,
            color: row.color,
            goal:
              row.goal_id && row.goal_period_type && row.goal_target_count
                ? {
                    id: row.goal_id,
                    periodType: row.goal_period_type as PeriodType,
                    targetCount: row.goal_target_count,
                    effectiveFrom: row.goal_effective_from ?? fromStr,
                    effectiveTo: row.goal_effective_to,
                  }
                : null,
            currentStreak: 0,
            bestStreak: 0,
            completions: {},
            createdAt: row.created_at || new Date().toISOString(),
          },
          completionRows: [],
        });
      }

      const existing = habitsById.get(row.habit_id)!;

      if (
        row.completion_year === null ||
        !row.completion_bitmap ||
        !row.completion_week_counts ||
        !row.completion_month_counts
      ) {
        continue;
      }

      Object.assign(
        existing.habit.completions,
        decodeBitmapToCompletionMap(
          row.completion_bitmap,
          row.completion_year,
          fromStr,
          toStr,
        ),
      );

      existing.completionRows.push({
        year: row.completion_year,
        bitmap: row.completion_bitmap,
        week_counts: row.completion_week_counts,
        month_counts: row.completion_month_counts,
      });
    }

    const habits: Habit[] = Array.from(habitsById.values()).map(
      ({ habit, completionRows }) => {
        if (!habit.goal) {
          return habit;
        }

        const { currentStreak, bestStreak } = computeStreaks(
          completionRows,
          {
            periodType: habit.goal.periodType,
            targetCount: habit.goal.targetCount,
          },
          weekStart,
        );

        return {
          ...habit,
          currentStreak,
          bestStreak,
        };
      },
    );

    return { habits, weekStart };
  },
);
