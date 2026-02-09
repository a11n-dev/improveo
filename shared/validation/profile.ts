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

const AvatarPathSchema = z.string().trim().min(1).max(512).nullable();

const TimezoneSchema = z.string().trim().min(1).max(64);

export const ProfileUpdatePayloadSchema = z
  .object({
    name: ProfileNameSchema.optional(),
    avatarPath: AvatarPathSchema.optional(),
    timezone: TimezoneSchema.optional(),
  })
  .strict();

export type ProfileUpdateInput = z.infer<typeof ProfileUpdatePayloadSchema>;
