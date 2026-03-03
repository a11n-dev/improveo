/**
 * DELETE /api/profile
 * Deletes the authenticated user's account and related data.
 */

import { serverSupabaseServiceRole } from "#supabase/server";

import { AVATAR_BUCKET } from "~~/shared/constants/storage";
import { requireUserId } from "~~/server/utils/request";

export default defineEventHandler(
  async (event): Promise<{ success: boolean }> => {
    const userId = await requireUserId(event);

    const supabase = serverSupabaseServiceRole<Database>(event);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("avatar_path")
      .eq("id", userId)
      .maybeSingle();

    // If the user has an avatar, attempt to remove it from storage before deleting the account
    if (profileData?.avatar_path) {
      const { error: storageError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .remove([profileData.avatar_path]);

      if (storageError) {
        console.error("Failed to remove avatar before account deletion", {
          userId,
          message: storageError.message,
        });
      }
    }

    // Delete the user account using Supabase's admin API
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      throw createError({
        statusCode: 500,
        message: "Failed to delete account",
      });
    }

    return { success: true };
  },
);
