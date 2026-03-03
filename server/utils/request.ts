import type { H3Event } from "h3";

import { serverSupabaseUser } from "#supabase/server";

/**
 * Returns the authenticated user id for the current request.
 * Throws 401 when no authenticated session is present.
 */
export const requireUserId = async (event: H3Event): Promise<string> => {
  const user = await serverSupabaseUser(event);

  if (!user?.sub) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  return user.sub;
};
