/**
 * DELETE /api/profile
 * Deletes the authenticated user's account and related data.
 */

import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";

export default defineEventHandler(
  async (event): Promise<{ success: boolean }> => {
    const user = await serverSupabaseUser(event);

    if (!user?.sub) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const adminClient = serverSupabaseServiceRole<Database>(event);

    const { error } = await adminClient.auth.admin.deleteUser(user.sub);

    if (error) {
      throw createError({
        statusCode: 500,
        message: "Failed to delete account",
      });
    }

    return { success: true };
  },
);
