/**
 * PATCH /api/profile/settings
 * Updates the authenticated user's profile settings.
 * Invalidates the server-side cache after update.
 */

import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

import { ProfileSettingsUpdatePayloadSchema } from "~~/shared/validation/settings";

export default defineEventHandler(async (event): Promise<ProfileSettings> => {
  const client = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);

  if (!user?.sub) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const payload = await parseBody(event, ProfileSettingsUpdatePayloadSchema);

  const updatePayload: TablesUpdate<"profile_settings"> = {
    ...(payload.colorMode !== undefined && {
      color_mode: payload.colorMode,
    }),
    ...(payload.reduceAnimations !== undefined && {
      reduce_animations: payload.reduceAnimations,
    }),
    ...(payload.weekStart !== undefined && {
      week_start: payload.weekStart,
    }),
  };

  const { data, error } = await client
    .from("profile_settings")
    .update(updatePayload)
    .eq("id", user.sub)
    .select("id, color_mode, reduce_animations, week_start, updated_at")
    .single();

  if (error || !data) {
    throw createError({
      statusCode: 500,
      message: "Failed to update settings",
    });
  }

  // Update cache with fresh data so next read avoids a DB query
  const settings = mapSettingsRowToDto(data);
  await cacheUserSettings(user.sub, settings);

  return settings;
});
