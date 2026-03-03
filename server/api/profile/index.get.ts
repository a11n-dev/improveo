/**
 * GET /api/profile
 * Returns combined profile/settings data for the authenticated user.
 * Includes profile + settings in a single request.
 */

import { serverSupabaseClient } from "#supabase/server";

import type { ProfileSettingsRow } from "~~/server/types/settings";
import type { ProfileRow } from "~~/server/types/user";
import { requireUser } from "~~/server/utils/request";
import type { ProfileWithSettings } from "~~/shared/types/user";

type ProfileWithSettingsRow = ProfileRow & {
  settings: ProfileSettingsRow;
};

export default defineEventHandler(
  async (event): Promise<ProfileWithSettings> => {
    const supabase = await serverSupabaseClient<Database>(event);
    const { id: userId, email } = await requireUser(event);

    const { data, error } = await supabase
      .from("profiles")
      .select(
        "id, username, avatar_path, timezone, created_at, settings:profile_settings!inner(id, color_mode, reduce_animations, week_start, updated_at)",
      )
      .eq("id", userId)
      .single();

    if (error || !data) {
      throw createError({
        statusCode: 500,
        message: "Failed to fetch profile",
      });
    }

    const row = data as unknown as ProfileWithSettingsRow;

    return {
      profile: mapProfileRowToDto(row, email),
      settings: mapSettingsRowToDto(row.settings),
    };
  },
);
