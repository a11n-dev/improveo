/**
 * POST /api/habits/:id/completions
 * Add a completion for a habit.
 * Body: { date: "YYYY-MM-DD" }
 * Calls the set_habit_completion RPC (fire-and-forget for streaks).
 */
import { serverSupabaseClient } from "#supabase/server";

import {
  CompletionDateBodySchema,
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
    const { date } = await readValidatedBody(
      event,
      CompletionDateBodySchema.parse,
    );

    await assertHabitOwnership(client, habitId, userId);

    const settings = await getUserSettings(event, userId);
    const weekStart = settings.weekStart as WeekStartDay;

    return setHabitCompletionAndComputeStreak(client, {
      habitId,
      date,
      completed: true,
      weekStart,
    });
  },
);
