import { AVATAR_BUCKET } from "~~/shared/constants/storage";

const MAX_AVATAR_FILE_SIZE = 3 * 1024 * 1024;
const ALLOWED_AVATAR_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const getAvatarExtension = (file: File): string => {
  const fileNameExtension = file.name.split(".").pop()?.toLowerCase();

  if (fileNameExtension === "jpg" || fileNameExtension === "jpeg") {
    return "jpg";
  }

  if (fileNameExtension === "png" || fileNameExtension === "webp") {
    return fileNameExtension;
  }

  if (file.type === "image/png") {
    return "png";
  }

  if (file.type === "image/webp") {
    return "webp";
  }

  return "jpg";
};

/**
 * Handles avatar object upload and cleanup operations in storage.
 */
export const useProfileAvatarStorage = () => {
  const { notifyMessage } = useNotify();
  const supabaseClient = useSupabaseClient();

  const uploadAvatar = async (userId: string, file: File): Promise<string> => {
    if (!ALLOWED_AVATAR_MIME_TYPES.has(file.type)) {
      throw new Error("Use JPG, PNG, or WEBP images");
    }

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      throw new Error("Avatar must be 3 MB or smaller");
    }

    const extension = getAvatarExtension(file);
    const filePath = `${userId}/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabaseClient.storage
      .from(AVATAR_BUCKET)
      .upload(filePath, file, {
        upsert: false,
        contentType: file.type,
        cacheControl: "3600",
      });

    if (error) {
      throw new Error(error.message);
    }

    return filePath;
  };

  const removeAvatarObject = async (avatarPath: string): Promise<boolean> => {
    const { error } = await supabaseClient.storage
      .from(AVATAR_BUCKET)
      .remove([avatarPath]);

    if (error) {
      notifyMessage({ scope: "profile", code: "avatar_cleanup_failed" });
      return false;
    }

    return true;
  };

  return {
    removeAvatarObject,
    uploadAvatar,
  };
};
