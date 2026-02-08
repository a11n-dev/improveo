import type { Tables, TablesUpdate } from "./database.types";

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
  email: Tables<"profiles">["email"];
  name: Tables<"profiles">["name"];
  avatarPath: Tables<"profiles">["avatar_path"];
  weekStart: Tables<"profiles">["week_start"];
  createdAt: Tables<"profiles">["created_at"];
}

/**
 * Profile update payload.
 * Fields that can be updated by the client.
 */
export interface ProfileUpdatePayload {
  weekStart?: TablesUpdate<"profiles">["week_start"];
  name?: TablesUpdate<"profiles">["name"];
  avatarPath?: TablesUpdate<"profiles">["avatar_path"];
}
