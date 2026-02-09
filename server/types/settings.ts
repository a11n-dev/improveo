/**
 * Server-side types for the profile_settings table.
 */

export type ProfileSettingsSelectRow = Pick<
  Tables<"profile_settings">,
  "id" | "color_mode" | "week_start" | "updated_at"
>;
