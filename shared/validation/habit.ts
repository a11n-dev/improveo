import { z } from "zod";

import {
  HABIT_COLOR_MAX_LENGTH,
  HABIT_COLOR_PATTERN,
  HABIT_DESCRIPTION_MAX_LENGTH,
  HABIT_ICON_MAX_LENGTH,
  HABIT_ICON_PATTERN,
  HABIT_TITLE_MIN_LENGTH,
  HABIT_TITLE_MAX_LENGTH,
  GOAL_COUNT_LIMITS,
} from "../constants/validation";

/** Allowed period values for habit goals. */
export const PeriodTypeSchema = z.enum(["day", "week", "month"]);

/** Reusable habit title validation used by create and update payloads. */
export const HabitTitleSchema = z
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

/** Reusable habit description validation used by create and update payloads. */
export const HabitDescriptionSchema = z
  .string()
  .trim()
  .max(
    HABIT_DESCRIPTION_MAX_LENGTH,
    `Description must be ${HABIT_DESCRIPTION_MAX_LENGTH} characters or less`,
  );

/** Reusable icon token validation (Iconify lucide token format). */
export const HabitIconSchema = z
  .string()
  .trim()
  .min(1, "Icon is required")
  .max(
    HABIT_ICON_MAX_LENGTH,
    `Icon must be ${HABIT_ICON_MAX_LENGTH} characters or less`,
  )
  .regex(HABIT_ICON_PATTERN, "Icon format is invalid");

/** Reusable color validation for canonical hex colors (`#RRGGBB`). */
export const HabitColorSchema = z
  .string()
  .trim()
  .min(1, "Color is required")
  .max(
    HABIT_COLOR_MAX_LENGTH,
    `Color must be ${HABIT_COLOR_MAX_LENGTH} characters or less`,
  )
  .regex(HABIT_COLOR_PATTERN, "Color format is invalid");

export const HabitGoalSchema = z
  .strictObject({
    periodType: PeriodTypeSchema,
    targetCount: z.number().int(),
  })
  .check((ctx) => {
    const { periodType, targetCount } = ctx.value;

    if (targetCount < 1) {
      ctx.issues.push({
        code: "custom",
        message: "Target count must be a positive integer",
        path: ["targetCount"],
        input: targetCount,
      });
      return;
    }

    const maxCount = GOAL_COUNT_LIMITS[periodType];
    if (targetCount > maxCount) {
      ctx.issues.push({
        code: "custom",
        message: `Target count must be ${maxCount} or less for ${periodType}`,
        path: ["targetCount"],
        input: targetCount,
      });
    }
  });

const HabitCreatePayloadShape = {
  title: HabitTitleSchema,
  description: HabitDescriptionSchema.optional(),
  icon: HabitIconSchema,
  color: HabitColorSchema,
  goal: HabitGoalSchema.nullable(),
};

export const HabitCreatePayloadSchema = z.strictObject(HabitCreatePayloadShape);

export const HabitUpdatePayloadSchema = HabitCreatePayloadSchema.partial()
  .extend({
    description: HabitDescriptionSchema.nullable().optional(),
  })
  .strict();
