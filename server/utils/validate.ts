import type { H3Event } from "h3";
import type { z } from "zod";

export const parseBody = async <TSchema extends z.ZodTypeAny>(
  event: H3Event,
  schema: TSchema,
): Promise<z.infer<TSchema>> => {
  const body = await readBody<unknown>(event);
  const result = schema.safeParse(body);

  if (!result.success) {
    const issue = result.error.issues[0];
    throw createError({
      statusCode: 400,
      message: issue?.message ?? "Invalid request body",
    });
  }

  return result.data;
};
