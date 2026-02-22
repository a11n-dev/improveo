import { z } from "zod";

import {
  EMAIL_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NAME_MIN_LENGTH,
  PROFILE_USERNAME_PATTERN,
} from "../constants/validation";

/**
 * Reusable email validator shared across auth and profile flows.
 *
 * Trims user input and applies format/length boundaries.
 */
export const EmailSchema = z
  .email("Enter a valid email address.")
  .trim()
  .toLowerCase()
  .max(
    EMAIL_MAX_LENGTH,
    `Email must be ${EMAIL_MAX_LENGTH} characters or less`,
  );

/**
 * Reusable username validator for account creation and editing.
 *
 * Normalizes to lowercase and restricts input to allowed characters.
 */
export const UsernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(
    PROFILE_NAME_MIN_LENGTH,
    `Must be at least ${PROFILE_NAME_MIN_LENGTH} characters`,
  )
  .max(
    PROFILE_NAME_MAX_LENGTH,
    `Must be ${PROFILE_NAME_MAX_LENGTH} characters or less`,
  )
  .regex(PROFILE_USERNAME_PATTERN, "Can contain only letters and numbers");
