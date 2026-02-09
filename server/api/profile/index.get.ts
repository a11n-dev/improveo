/**
 * GET /api/profile
 * Returns the authenticated user's profile.
 */

import { serverSupabaseClient, serverSupabaseUser } from "#supabase/server";

export default defineEventHandler(async (event): Promise<Profile> => {
  const supabase = await serverSupabaseClient<Database>(event);
  const user = await serverSupabaseUser(event);

  if (!user?.sub) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, name, avatar_path, timezone, created_at")
    .eq("id", user.sub)
    .single();

  if (error) {
    throw createError({ statusCode: 500, message: "Failed to fetch profile" });
  }

  return mapProfileRowToDto(data);
});
