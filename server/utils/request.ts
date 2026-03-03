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

/**
 * Returns the authenticated user id and email for the current request.
 * @throws 401 when no authenticated session is present.
 */
export const requireUser = async (
  event: H3Event,
): Promise<{ id: string; email: string }> => {
  const user = await serverSupabaseUser(event);

  if (!user?.sub || !user.email) {
    throw createError({ statusCode: 401, message: "Unauthorized" });
  }

  return { id: user.sub, email: user.email };
};
