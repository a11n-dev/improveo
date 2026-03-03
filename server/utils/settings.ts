import type { H3Event } from "h3";

import { serverSupabaseClient } from "#supabase/server";

import type { ProfileSettingsRow } from "~~/server/types/settings";
import { requireUserId } from "~~/server/utils/request";

/**
 * Cache key prefix for profile settings in Nitro storage.
 * Full key: `profile-settings:{userId}`
 */
const CACHE_PREFIX = "profile-settings";

/**
 * Maps a profile_settings DB row to the shared ProfileSettings DTO.
 */
export const mapSettingsRowToDto = (
  row: ProfileSettingsRow,
): ProfileSettings => {
  return {
    colorMode: row.color_mode as ColorModePreference,
    reduceAnimations: row.reduce_animations,
    weekStart: row.week_start,
    updatedAt: row.updated_at,
  };
};

/**
 * Default settings returned when no DB row exists yet
 * (should not happen due to the trigger, but a safe fallback).
 */
const DEFAULT_SETTINGS: ProfileSettings = {
  colorMode: "system",
  reduceAnimations: false,
  weekStart: 0,
  updatedAt: new Date().toISOString(),
};

/**
 * Retrieves user settings, checking the Nitro storage cache first,
 * then falling back to a DB query. Caches the result on miss.
 *
 * @param event - H3 event (provides auth context)
 * @returns The user's ProfileSettings DTO
 */
export const getUserSettings = async (
  event: H3Event,
  userId?: string,
): Promise<ProfileSettings> => {
  const resolvedUserId = userId ?? (await requireUserId(event));

  const storage = useStorage("redis");
  const cacheKey = `${CACHE_PREFIX}:${resolvedUserId}`;

  // Try cache first
  const cached = await storage.getItem<ProfileSettings>(cacheKey);
  if (cached) {
    return cached;
  }

  // Cache miss — fetch from DB
  const client = await serverSupabaseClient<Database>(event);
  const { data, error } = await client
    .from("profile_settings")
    .select("id, color_mode, reduce_animations, week_start, updated_at")
    .eq("id", resolvedUserId)
    .single();

  if (error || !data) {
    // Row should exist via trigger; return defaults as fallback
    return DEFAULT_SETTINGS;
  }

  const settings = mapSettingsRowToDto(data);

  // Store in cache
  await storage.setItem(cacheKey, settings);

  return settings;
};

/**
 * Writes fresh settings into the cache for a specific user.
 * Call this after any settings update to keep the cache warm.
 *
 * @param userId - The user UUID
 * @param settings - The updated ProfileSettings to cache
 */
export const cacheUserSettings = async (
  userId: string,
  settings: ProfileSettings,
): Promise<void> => {
  const storage = useStorage("redis");
  const cacheKey = `${CACHE_PREFIX}:${userId}`;
  await storage.setItem(cacheKey, settings);
};
