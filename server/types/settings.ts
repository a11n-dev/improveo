/**
 * Server-side types for the profile_settings table.
 */

import type { Tables } from "~~/shared/types/database.types";

/** Server row projection for `public.profile_settings`. */
export type ProfileSettingsRow = Pick<
  Tables<"profile_settings">,
  "id" | "color_mode" | "reduce_animations" | "week_start" | "updated_at"
>;
