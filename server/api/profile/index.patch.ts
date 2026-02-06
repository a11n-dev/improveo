/**
 * PATCH /api/profile
 * Updates the authenticated user's profile settings.
 */

import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

import { parseBody } from "~~/server/utils/validate";
import { ProfileUpdatePayloadSchema } from "~~/shared/validation/profile";

export default defineEventHandler(async (event): Promise<Profile> => {
  const client = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);

  if (!user?.sub) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const payload = await parseBody(event, ProfileUpdatePayloadSchema);

  const updatePayload = {
    ...(payload.weekStart !== undefined && { week_start: payload.weekStart }),
    ...(payload.name !== undefined && { name: payload.name }),
  };

  const { data, error } = await client
    .from("profiles")
    .update(updatePayload)
    .eq("id", user.sub)
    .select("id, email, name, week_start, created_at")
    .single();

  if (error) {
    throw createError({ statusCode: 500, message: "Failed to update profile" });
  }

  const row = data as Record<string, unknown>;

  return {
    id: String(row.id),
    email: String(row.email),
    name: row.name ? String(row.name) : null,
    weekStart: Number(row.week_start),
    createdAt: String(row.created_at),
  };
});
