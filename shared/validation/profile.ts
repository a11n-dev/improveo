import { z } from "zod";

import { UsernameSchema } from "./auth";

const AvatarPathSchema = z.string().trim().min(1).max(512).nullable();

const TimezoneSchema = z.string().trim().min(1).max(64);

export const ProfileUpdatePayloadSchema = z
  .object({
    username: UsernameSchema.optional(),
    avatarPath: AvatarPathSchema.optional(),
    timezone: TimezoneSchema.optional(),
  })
  .strict();

export type ProfileUpdateInput = z.infer<typeof ProfileUpdatePayloadSchema>;
