/**
 * PATCH /api/profile
 * Updates the authenticated user's profile fields (username, avatar, timezone).
 */

import { serverSupabaseClient } from "#supabase/server";

import { requireUser } from "~~/server/utils/request";
import { ProfileUpdatePayloadSchema } from "~~/shared/validation/profile";

export default defineEventHandler(async (event): Promise<Profile> => {
  const client = await serverSupabaseClient<Database>(event);
  const { id: userId, email } = await requireUser(event);

  const payload = await readValidatedBody(
    event,
    ProfileUpdatePayloadSchema.parse,
  );

  const updatePayload: TablesUpdate<"profiles"> = {
    ...(payload.username !== undefined && { username: payload.username }),
    ...(payload.avatarPath !== undefined && {
      avatar_path: payload.avatarPath,
    }),
    ...(payload.timezone !== undefined && { timezone: payload.timezone }),
  };

  const { data, error } = await client
    .from("profiles")
    .update(updatePayload)
    .eq("id", userId)
    .select("id, username, avatar_path, timezone, created_at")
    .single();

  if (error) {
    if (error.code === "23505" && payload.username !== undefined) {
      throw createError({
        statusCode: 409,
        message: "Username is already taken",
      });
    }

    throw createError({ statusCode: 500, message: "Failed to update profile" });
  }

  return mapProfileRowToDto(data, email);
});
