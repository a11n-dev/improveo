/**
 * GET /api/profile/availability
 * Returns whether a username is currently available.
 */

import { z } from "zod";

import { serverSupabaseServiceRole } from "#supabase/server";

import { UsernameSchema } from "~~/shared/validation/auth";

export default defineEventHandler(
  async (event): Promise<{ available: boolean }> => {
    setResponseHeader(event, "Cache-Control", "no-store");

    const { username } = await getValidatedQuery(
      event,
      z.object({
        username: UsernameSchema,
      }).parse,
    );

    const client = serverSupabaseServiceRole<Database>(event);

    const { data, error } = await client
      .from("profiles")
      .select("id")
      .eq("username", username)
      .limit(1);

    if (error) {
      throw createError({
        statusCode: 500,
        message: "Failed to check username availability",
      });
    }

    return { available: data.length === 0 };
  },
);
