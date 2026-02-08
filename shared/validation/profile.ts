import { z } from "zod";

import {
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NAME_MIN_LENGTH,
} from "../constants/validation";

const ProfileNameSchema = z
  .string()
  .trim()
  .min(
    PROFILE_NAME_MIN_LENGTH,
    `Name must be at least ${PROFILE_NAME_MIN_LENGTH} characters`,
  )
  .max(
    PROFILE_NAME_MAX_LENGTH,
    `Name must be ${PROFILE_NAME_MAX_LENGTH} characters or less`,
  );

const WeekStartSchema = z
  .number()
  .int()
  .min(0, "Choose a day from Monday to Sunday")
  .max(6, "Choose a day from Monday to Sunday");

const AvatarPathSchema = z.string().trim().min(1).max(512).nullable();

export const ProfileUpdatePayloadSchema = z
  .object({
    weekStart: WeekStartSchema.optional(),
    name: ProfileNameSchema.optional(),
    avatarPath: AvatarPathSchema.optional(),
  })
  .strict();

export type ProfileUpdateInput = z.infer<typeof ProfileUpdatePayloadSchema>;
