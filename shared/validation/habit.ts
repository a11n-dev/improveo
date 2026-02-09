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

const PeriodTypeSchema = z.enum(["day", "week", "month"]);

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

const applyGoalRules = (
  value: {
    periodType: z.infer<typeof PeriodTypeSchema>;
    targetCount: number;
  },
  ctx: z.RefinementCtx,
) => {
  if (value.targetCount < 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Target count must be a positive integer",
      path: ["targetCount"],
    });
    return;
  }

  const maxCount = GOAL_COUNT_LIMITS[value.periodType];
  if (value.targetCount > maxCount) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Target count must be ${maxCount} or less for ${value.periodType}`,
      path: ["targetCount"],
    });
  }
};

export const HabitGoalSchema = z
  .object({
    periodType: PeriodTypeSchema,
    targetCount: z.number().int(),
  })
  .superRefine(applyGoalRules);

export const HabitCreatePayloadSchema = z
  .object({
    title: HabitTitleSchema,
    description: HabitDescriptionSchema.optional(),
    icon: HabitIconSchema,
    color: HabitColorSchema,
    goal: HabitGoalSchema.nullable(),
  })
  .strict();

export const HabitUpdatePayloadSchema = z
  .object({
    title: HabitTitleSchema.optional(),
    description: HabitDescriptionSchema.nullable().optional(),
    icon: HabitIconSchema.optional(),
    color: HabitColorSchema.optional(),
    goal: HabitGoalSchema.nullable().optional(),
  })
  .strict();

export type HabitCreateInput = z.infer<typeof HabitCreatePayloadSchema>;
export type HabitUpdateInput = z.infer<typeof HabitUpdatePayloadSchema>;
export type HabitGoalInput = z.infer<typeof HabitGoalSchema>;
