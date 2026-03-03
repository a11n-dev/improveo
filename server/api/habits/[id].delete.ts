/**
 * DELETE /api/habits/:id
 * Delete a habit and all its completions (cascade).
 */
import { serverSupabaseClient } from "#supabase/server";

import { assertHabitOwnership } from "~~/server/utils/habits";
import { requireUserId } from "~~/server/utils/request";
import { HabitIdParamsSchema } from "~~/server/validation/habits";

export default defineEventHandler(
  async (event): Promise<{ success: boolean }> => {
    const client = await serverSupabaseClient<Database>(event);
    const userId = await requireUserId(event);
    const { id: habitId } = await getValidatedRouterParams(
      event,
      HabitIdParamsSchema.parse,
    );

    await assertHabitOwnership(client, habitId, userId);

    // Delete the habit (completions will cascade)
    const { error: deleteError } = await client
      .from("habits")
      .delete()
      .eq("id", habitId)
      .eq("user_id", userId);

    if (deleteError) {
      throw createError({ statusCode: 500, message: "Failed to delete habit" });
    }

    return { success: true };
  },
);
