/** Maximum allowed avatar file size in bytes (3 MB). */
export const MAX_AVATAR_FILE_SIZE = 3 * 1024 * 1024;

/** Supported MIME types for avatar uploads. */
export const ALLOWED_AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);
