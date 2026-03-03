import { AVATAR_BUCKET } from "~~/shared/constants/storage";

/**
 * Generates a public URL for a user's avatar stored in Supabase Storage.
 */
export const getAvatarPublicUrl = (
  supabaseClient: ReturnType<typeof useSupabaseClient<Database>>,
  avatarPath: string | null | undefined,
): string | undefined => {
  if (!avatarPath) {
    return undefined;
  }

  const { data } = supabaseClient.storage
    .from(AVATAR_BUCKET)
    .getPublicUrl(avatarPath);

  return data.publicUrl;
};
