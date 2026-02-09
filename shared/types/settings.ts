import type { Tables, TablesUpdate } from "./database.types";

/**
 * Shared profile settings types used by both client and server.
 * Mirrors the public.profile_settings schema with camelCase for client usage.
 */

/** Color mode preference persisted to DB */
export type ColorModePreference = "light" | "dark" | "system";

/**
 * Profile settings DTO.
 * Maps from profile_settings table to client-friendly shape.
 */
export interface ProfileSettings {
  colorMode: ColorModePreference;
  weekStart: Tables<"profile_settings">["week_start"];
  updatedAt: Tables<"profile_settings">["updated_at"];
}

/**
 * Payload for updating profile settings.
 * All fields optional — only send changed fields.
 */
export interface ProfileSettingsUpdatePayload {
  colorMode?: TablesUpdate<"profile_settings">["color_mode"];
  weekStart?: TablesUpdate<"profile_settings">["week_start"];
}
