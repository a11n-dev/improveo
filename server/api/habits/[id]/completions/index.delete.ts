/**
 * DELETE /api/habits/:id/completions
 * Remove a completion for a habit.
 * Query param: date=YYYY-MM-DD
 * Calls the set_habit_completion RPC with p_value=0.
 */
import { serverSupabaseClient } from "#supabase/server";

import {
  assertHabitOwnership,
  setHabitCompletionAndComputeStreak,
} from "~~/server/utils/habits";
import { requireUserId } from "~~/server/utils/request";
import {
  CompletionDateQuerySchema,
  HabitIdParamsSchema,
} from "~~/server/validation/habits";
import { getUserSettings } from "~~/server/utils/settings";

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
