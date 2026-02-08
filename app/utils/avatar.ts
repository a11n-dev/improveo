import { AVATAR_BUCKET } from "~~/shared/constants/storage";

/**
 * Generates a public URL for a user's avatar stored in Supabase Storage.
 * @param supabaseClient The Supabase client instance to use for generating the URL.
 * @param avatarPath The storage path of the avatar image. If null or undefined, returns undefined.
 * @returns The public URL of the avatar image, or undefined if no avatar path is provided.
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
