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

import { serverSupabaseClient } from "#supabase/server";

import type { CompletionBitmapRow } from "~~/server/types/habit";
import { HabitsRangeQuerySchema } from "~~/server/validation/habits";

type HabitsOverviewRow =
  Database["public"]["Functions"]["get_habits_overview"]["Returns"][number];

interface HabitAggregate {
  habit: Habit;
  completionRows: CompletionBitmapRow[];
}

export default defineEventHandler(
  async (event): Promise<HabitsListResponse> => {
    const client = await serverSupabaseClient<Database>(event);
    const userId = await requireUserId(event);

    const query = await getValidatedQuery(event, HabitsRangeQuerySchema.parse);
    const { fromStr, toStr } = getHabitRangeFromQuery(query);

    const [settings, overviewResult] = await Promise.all([
      getUserSettings(event, userId),
      client.rpc("get_habits_overview", {
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
        const goal =
          row.goal_id && row.goal_period_type && row.goal_target_count
            ? mapGoalVersionRowToDto({
                id: row.goal_id,
                period_type: row.goal_period_type,
                target_count: row.goal_target_count,
                effective_from: row.goal_effective_from ?? fromStr,
                effective_to: row.goal_effective_to,
              })
            : null;

        habitsById.set(row.habit_id, {
          habit: mapHabitRowToDto(
            {
              id: row.habit_id,
              title: row.title,
              description: row.description,
              icon: row.icon,
              color: row.color,
              created_at: row.created_at,
            },
            goal,
            {},
            { currentStreak: 0, bestStreak: 0 },
          ),
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
        const { currentStreak, bestStreak } = computeHabitStreak(
          habit.goal,
          completionRows,
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
