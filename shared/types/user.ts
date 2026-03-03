import type { Tables, TablesUpdate } from "./database.types";
import type { ProfileSettings } from "./settings";

/**
 * Shared user/profile types used by both client and server.
 * DTO shape stays camelCase while field primitives come from database types.
 */

/**
 * User profile data from the profiles table.
 * Mirrors the public.profiles schema with camelCase for client usage.
 */
export interface Profile {
  id: Tables<"profiles">["id"];
  email: string;
  username: Tables<"profiles">["username"];
  avatarPath: Tables<"profiles">["avatar_path"];
  timezone: Tables<"profiles">["timezone"];
  createdAt: Tables<"profiles">["created_at"];
}

/**
 * Combined payload returned by GET /api/profile.
 * Includes profile + settings in one response.
 */
export interface ProfileWithSettings {
  profile: Profile;
  settings: ProfileSettings;
}

/**
 * Profile update payload.
 * Fields that can be updated by the client.
 */
export interface ProfileUpdatePayload {
  username?: TablesUpdate<"profiles">["username"];
  avatarPath?: TablesUpdate<"profiles">["avatar_path"];
  timezone?: TablesUpdate<"profiles">["timezone"];
}
