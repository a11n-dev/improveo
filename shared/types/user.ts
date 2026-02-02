/**
 * Shared user/profile types used by both client and server.
 * These DTOs decouple the client from the database schema.
 */

/**
 * User profile data from the profiles table.
 * Mirrors the public.profiles schema with camelCase for client usage.
 */
export interface Profile {
  /** User ID (UUID) - FK to auth.users */
  id: string;
  /** User's email address */
  email: string;
  /** Display name (null if not set) */
  name: string | null;
  /** Week start day: 0 = Monday, 1 = Tuesday, ..., 6 = Sunday - ISO 8601 standard */
  weekStart: number;
  /** Account creation timestamp */
  createdAt: string;
}

/**
 * Profile update payload.
 * Fields that can be updated by the client.
 */
export interface ProfileUpdatePayload {
  /** Week start day preference */
  weekStart?: number;
  /** Display name */
  name?: string;
}
