/**
 * Server-side types for the profile_settings table.
 */

export type ProfileSettingsRow = Pick<
  Tables<"profile_settings">,
  "id" | "color_mode" | "reduce_animations" | "week_start" | "updated_at"
>;
