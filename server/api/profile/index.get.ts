/**
 * GET /api/profile
 * Returns combined profile/settings data for the authenticated user.
 * Includes profile + settings in a single request.
 */

import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

import type { ProfileSettingsSelectRow } from "~~/server/types/settings";
import type { ProfileSelectRow } from "~~/server/types/user";
import type { ProfileWithSettings } from "~~/shared/types/user";

type ProfileWithSettingsRow = ProfileSelectRow & {
  settings: ProfileSettingsSelectRow;
};

export default defineEventHandler(
  async (event): Promise<ProfileWithSettings> => {
    const supabase = await serverSupabaseClient<Database>(event);
    const user = await serverSupabaseUser(event);

    if (!user?.sub) {
      throw createError({ statusCode: 401, message: "Unauthorized" });
    }

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, avatar_path, timezone, created_at, settings:profile_settings!inner(id, color_mode, reduce_animations, week_start, updated_at)",
      )
      .eq("id", user.sub)
      .single();

    if (error || !data) {
      throw createError({
        statusCode: 500,
        message: "Failed to fetch profile",
      });
    }

    const row = data as unknown as ProfileWithSettingsRow;

    return {
      profile: mapProfileRowToDto(row, user.email ?? ""),
      settings: mapSettingsRowToDto(row.settings),
    };
  },
);
