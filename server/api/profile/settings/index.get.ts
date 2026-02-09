/**
 * GET /api/profile/settings
 * Returns the authenticated user's profile settings (color mode, week start).
 * Uses server-side caching via getUserSettings().
 */

export default defineEventHandler(async (event): Promise<ProfileSettings> => {
  return getUserSettings(event);
});
