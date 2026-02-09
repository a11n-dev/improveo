export const EMAIL_MAX_LENGTH = 254;
export const PROFILE_NAME_MIN_LENGTH = 3;
export const PROFILE_NAME_MAX_LENGTH = 30;

export const HABIT_TITLE_MIN_LENGTH = 1;
export const HABIT_TITLE_MAX_LENGTH = 50;
export const HABIT_DESCRIPTION_MAX_LENGTH = 100;
export const HABIT_ICON_MAX_LENGTH = 64;
export const HABIT_COLOR_MAX_LENGTH = 16;

export const HABIT_ICON_PATTERN = /^i-lucide-[a-z0-9-]+$/;
export const HABIT_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export const GOAL_COUNT_LIMITS = {
  day: 1,
  week: 7,
  month: 31,
} as const;
