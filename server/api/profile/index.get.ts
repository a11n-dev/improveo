/**
 * GET /api/profile
 * Returns the authenticated user's profile.
 */

import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event): Promise<Profile> => {
  const client = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);

  if (!user?.sub) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const { data, error } = await client
    .from("profiles")
    .select("id, email, name, week_start, created_at")
    .eq("id", user.sub)
    .single();

  if (error) {
    throw createError({ statusCode: 500, message: "Failed to fetch profile" });
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
