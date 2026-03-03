import type { ProfileRow } from "~~/server/types/user";

/**
 * Maps a database row from the profiles table to a Profile DTO.
 * Email is supplied from auth context (auth.users), not public.profiles.
 */
export const mapProfileRowToDto = (row: ProfileRow, email: string): Profile => {
  return {
    id: row.id,
    email,
    username: row.username,
    avatarPath: row.avatar_path,
    timezone: row.timezone,
    createdAt: row.created_at,
  };
};
