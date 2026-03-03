/**
 * DELETE /api/habits/:id/completions
 * Remove a completion for a habit.
 * Query param: date=YYYY-MM-DD
 * Calls the set_habit_completion RPC with p_value=0.
 */
import { serverSupabaseClient } from "#supabase/server";

import {
  CompletionDateQuerySchema,
  HabitIdParamsSchema,
} from "~~/server/validation/habits";

export default defineEventHandler(
  async (event): Promise<CompletionToggleResponse> => {
    const client = await serverSupabaseClient<Database>(event);
    const userId = await requireUserId(event);
    const { id: habitId } = await getValidatedRouterParams(
      event,
      HabitIdParamsSchema.parse,
    );
    const { date } = await getValidatedQuery(
      event,
      CompletionDateQuerySchema.parse,
    );

    await assertHabitOwnership(client, habitId, userId);

    const settings = await getUserSettings(event, userId);
    const weekStart = settings.weekStart as WeekStartDay;

    return setHabitCompletionAndComputeStreak(client, {
      habitId,
      date,
      completed: false,
      weekStart,
    });
  },
);
