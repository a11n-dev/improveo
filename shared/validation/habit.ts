import { z } from "zod";

import {
  HABIT_COLOR_MAX_LENGTH,
  HABIT_COLOR_PATTERN,
  HABIT_DESCRIPTION_MAX_LENGTH,
  HABIT_ICON_MAX_LENGTH,
  HABIT_ICON_PATTERN,
  HABIT_TITLE_MIN_LENGTH,
  HABIT_TITLE_MAX_LENGTH,
  STREAK_COUNT_LIMITS,
} from "~~/shared/constants/validation";

const StreakIntervalSchema = z.enum(["daily", "weekly", "monthly"]);

const HabitTitleSchema = z
  .string()
  .trim()
  .min(
    HABIT_TITLE_MIN_LENGTH,
    HABIT_TITLE_MIN_LENGTH === 1
      ? "Title is required"
      : `Title must be at least ${HABIT_TITLE_MIN_LENGTH} characters`,
  )
  .max(
    HABIT_TITLE_MAX_LENGTH,
    `Title must be ${HABIT_TITLE_MAX_LENGTH} characters or less`,
  );

const HabitDescriptionSchema = z
  .string()
  .trim()
  .max(
    HABIT_DESCRIPTION_MAX_LENGTH,
    `Description must be ${HABIT_DESCRIPTION_MAX_LENGTH} characters or less`,
  );

const HabitIconSchema = z
  .string()
  .trim()
  .min(1, "Icon is required")
  .max(
    HABIT_ICON_MAX_LENGTH,
    `Icon must be ${HABIT_ICON_MAX_LENGTH} characters or less`,
  )
  .regex(HABIT_ICON_PATTERN, "Icon format is invalid");

const HabitColorSchema = z
  .string()
  .trim()
  .min(1, "Color is required")
  .max(
    HABIT_COLOR_MAX_LENGTH,
    `Color must be ${HABIT_COLOR_MAX_LENGTH} characters or less`,
  )
  .regex(HABIT_COLOR_PATTERN, "Color format is invalid");

const applyStreakRules = (
  value: {
    streakInterval: z.infer<typeof StreakIntervalSchema> | null;
    streakCount: number;
  },
  ctx: z.RefinementCtx,
) => {
  if (value.streakInterval === null) {
    if (value.streakCount !== 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Streak count must be 0 when streak interval is disabled",
        path: ["streakCount"],
      });
    }
    return;
  }

  if (value.streakCount < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Streak count must be a positive integer",
      path: ["streakCount"],
    });
    return;
  }

  const maxCount = STREAK_COUNT_LIMITS[value.streakInterval];
  if (value.streakCount > maxCount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Streak count must be ${maxCount} or less for ${value.streakInterval}`,
      path: ["streakCount"],
    });
  }
};

export const HabitStreakSchema = z
  .object({
    streakInterval: StreakIntervalSchema.nullable(),
    streakCount: z.number().int(),
  })
  .superRefine(applyStreakRules);

export const HabitCreatePayloadSchema = z
  .object({
    title: HabitTitleSchema,
    description: HabitDescriptionSchema.optional(),
    icon: HabitIconSchema,
    color: HabitColorSchema,
    streakInterval: StreakIntervalSchema.nullable(),
    streakCount: z.number().int(),
  })
  .superRefine(applyStreakRules)
  .strict();

export const HabitUpdatePayloadSchema = z
  .object({
    title: HabitTitleSchema.optional(),
    description: HabitDescriptionSchema.nullable().optional(),
    icon: HabitIconSchema.optional(),
    color: HabitColorSchema.optional(),
    streakInterval: StreakIntervalSchema.nullable().optional(),
    streakCount: z.number().int().optional(),
  })
  .strict();

export type HabitCreateInput = z.infer<typeof HabitCreatePayloadSchema>;
export type HabitUpdateInput = z.infer<typeof HabitUpdatePayloadSchema>;
export type HabitStreakInput = z.infer<typeof HabitStreakSchema>;
