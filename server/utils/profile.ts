import type { ProfileSelectRow } from "~~/server/types/user";

/**
 * Maps a database row from the profiles table to a Profile DTO. Handles type conversions and nullability for each field.
 * @param row The database row to map.
 * @returns The mapped Profile DTO.
 */
export const mapProfileRowToDto = (row: ProfileSelectRow): Profile => {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarPath: row.avatar_path,
    weekStart: row.week_start,
    createdAt: row.created_at,
  };
};
