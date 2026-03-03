/**
 * PATCH /api/profile
 * Updates the authenticated user's profile fields (username, avatar, timezone).
 */

import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

import { ProfileUpdatePayloadSchema } from "~~/shared/validation/profile";

export default defineEventHandler(async (event): Promise<Profile> => {
  const client = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);

  if (!user?.sub) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

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
    .eq("id", user.sub)
    .select("id, username, avatar_path, timezone, created_at")
    .single();

  if (error) {
    throw createError({ statusCode: 500, message: "Failed to update profile" });
  }

  return mapProfileRowToDto(data, user.email ?? "");
});
