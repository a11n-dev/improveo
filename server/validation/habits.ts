import { z } from "zod";

/**
 * Server-only transport schemas for habits endpoints.
 *
 * These validate HTTP params/query/body envelopes and are intentionally kept
 * separate from shared domain payload schemas in `shared/validation/habit`.
 */

/** Shared validation for ISO date strings (`YYYY-MM-DD`). */
const IsoDateStringSchema = z.iso.date("Valid date (YYYY-MM-DD) is required");

/** Route params schema for habit id routes. */
export const HabitIdParamsSchema = z.strictObject({
  id: z.uuid("Habit ID is invalid"),
});

/** Query schema for GET /api/habits date range. */
export const HabitsRangeQuerySchema = z
  .object({
    from: IsoDateStringSchema.optional(),
    to: IsoDateStringSchema.optional(),
  })
  .check((ctx) => {
    const { from, to } = ctx.value;

    if (!from || !to) {
      return;
    }

    if (from > to) {
      ctx.issues.push({
        code: "custom",
        message: "`from` must be before or equal to `to`",
        path: ["from"],
        input: from,
      });
    }
  });

/** Body schema for completion create payload. */
export const CompletionDateBodySchema = z.strictObject({
  date: IsoDateStringSchema,
});

/** Query schema for completion delete payload. */
export const CompletionDateQuerySchema = z.object({
  date: IsoDateStringSchema,
});
