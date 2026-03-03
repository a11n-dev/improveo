import type { Tables, TablesUpdate } from "./database.types";

/**
 * Shared profile settings types used by both client and server.
 * Mirrors the public.profile_settings schema with camelCase for client usage.
 */

/** Color mode preference persisted to DB */
export type ColorModePreference = Tables<"profile_settings">["color_mode"];

/**
 * Profile settings DTO.
 * Maps from profile_settings table to client-friendly shape.
 */
export interface ProfileSettings {
  colorMode: ColorModePreference;
  reduceAnimations: Tables<"profile_settings">["reduce_animations"];
  weekStart: Tables<"profile_settings">["week_start"];
  updatedAt: Tables<"profile_settings">["updated_at"];
}

/**
 * Payload for updating profile settings.
 * All fields optional — only send changed fields.
 */
export interface ProfileSettingsUpdatePayload {
  colorMode?: TablesUpdate<"profile_settings">["color_mode"];
  reduceAnimations?: TablesUpdate<"profile_settings">["reduce_animations"];
  weekStart?: TablesUpdate<"profile_settings">["week_start"];
}
