/**
 * DELETE /api/habits/:id
 * Delete a habit and all its completions (cascade).
 */
import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(
  async (event): Promise<{ success: boolean }> => {
    const client = await serverSupabaseClient<Database>(event);
    const user = await serverSupabaseUser(event);

    if (!user?.sub) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const habitId = getRouterParam(event, "id");

    if (!habitId) {
      throw createError({ statusCode: 400, message: "Habit ID is required" });
    }

    // Verify the habit belongs to the user before deleting
    const { data: existing, error: fetchError } = await client
      .from("habits")
      .select("id")
      .eq("id", habitId)
      .eq("user_id", user.sub)
      .single();

    if (fetchError || !existing) {
      throw createError({ statusCode: 404, message: "Habit not found" });
    }

    // Delete the habit (completions will cascade)
    const { error: deleteError } = await client
      .from("habits")
      .delete()
      .eq("id", habitId)
      .eq("user_id", user.sub);

    if (deleteError) {
      throw createError({ statusCode: 500, message: "Failed to delete habit" });
    }

    return { success: true };
  },
);
