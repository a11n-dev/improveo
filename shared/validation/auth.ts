import { z } from "zod";

import {
  EMAIL_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NAME_MIN_LENGTH,
} from "~~/shared/constants/validation";

const EmailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .max(EMAIL_MAX_LENGTH, `Email must be ${EMAIL_MAX_LENGTH} characters or less`)
  .email("Invalid email");

const NameSchema = z
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

const OptionalNameSchema = z.preprocess((value) => {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
}, NameSchema.optional());

export const AuthLoginSchema = z
  .object({
    email: EmailSchema,
    name: OptionalNameSchema,
  })
  .strict();

export const AuthRegisterSchema = z
  .object({
    email: EmailSchema,
    name: NameSchema,
  })
  .strict();

export type AuthLoginInput = z.output<typeof AuthLoginSchema>;
export type AuthRegisterInput = z.output<typeof AuthRegisterSchema>;
