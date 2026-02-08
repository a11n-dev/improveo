/**
 * DELETE /api/profile
 * Deletes the authenticated user's account and related data.
 */

import {
  serverSupabaseServiceRole,
  serverSupabaseUser,
} from "#supabase/server";

import { AVATAR_BUCKET } from "~~/shared/constants/storage";

export default defineEventHandler(
  async (event): Promise<{ success: boolean }> => {
    const user = await serverSupabaseUser(event);

    if (!user?.sub) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const supabase = serverSupabaseServiceRole<Database>(event);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("avatar_path")
      .eq("id", user.sub)
      .maybeSingle();

    // If the user has an avatar, attempt to remove it from storage before deleting the account
    if (profileData?.avatar_path) {
      const { error: storageError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .remove([profileData.avatar_path]);

      if (storageError) {
        console.error("Failed to remove avatar before account deletion", {
          userId: user.sub,
          message: storageError.message,
        });
      }
    }

    // Delete the user account using Supabase's admin API
    const { error } = await supabase.auth.admin.deleteUser(user.sub);

    if (error) {
      throw createError({
        statusCode: 500,
        message: "Failed to delete account",
      });
    }

    return { success: true };
  },
);
