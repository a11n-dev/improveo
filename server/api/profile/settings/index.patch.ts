/**
 * PATCH /api/profile/settings
 * Updates the authenticated user's profile settings.
 * Invalidates the server-side cache after update.
 */

import { serverSupabaseClient } from "#supabase/server";

import { requireUserId } from "~~/server/utils/request";
import { ProfileSettingsUpdatePayloadSchema } from "~~/shared/validation/settings";

export default defineEventHandler(async (event): Promise<ProfileSettings> => {
  const client = await serverSupabaseClient<Database>(event);
  const userId = await requireUserId(event);

  const payload = await readValidatedBody(
    event,
    ProfileSettingsUpdatePayloadSchema.parse,
  );

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
    .eq("id", userId)
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
  await cacheUserSettings(userId, settings);

  return settings;
});
