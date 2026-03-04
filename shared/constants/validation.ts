/** Max RFC-compliant email length. */
export const EMAIL_MAX_LENGTH = 254;
/** Minimum profile username length. */
export const PROFILE_NAME_MIN_LENGTH = 3;
/** Maximum profile username length. */
export const PROFILE_NAME_MAX_LENGTH = 30;
/** Allowed username characters. */
export const PROFILE_USERNAME_PATTERN = /^[a-z0-9]+$/;
/** Debounce delay before checking username availability (ms). */
export const USERNAME_CHECK_DEBOUNCE_MS = 500;

/** Minimum habit title length. */
export const HABIT_TITLE_MIN_LENGTH = 1;
/** Maximum habit title length. */
export const HABIT_TITLE_MAX_LENGTH = 50;
/** Maximum habit description length. */
export const HABIT_DESCRIPTION_MAX_LENGTH = 100;
/** Maximum icon token length. */
export const HABIT_ICON_MAX_LENGTH = 64;
/** Maximum color token length. */
export const HABIT_COLOR_MAX_LENGTH = 16;

/** Allowed icon token pattern (`i-lucide-*`). */
export const HABIT_ICON_PATTERN = /^i-lucide-[a-z0-9-]+$/;
/** Allowed hex color pattern (`#RRGGBB`). */
export const HABIT_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

/** Per-period target count upper bounds. */
export const GOAL_COUNT_LIMITS = {
  day: 1,
  week: 7,
  month: 31,
} as const;
