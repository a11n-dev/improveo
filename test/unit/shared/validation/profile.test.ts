import { describe, expect, it } from "vitest";

import {
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NAME_MIN_LENGTH,
} from "../../../../shared/constants/validation";
import { ProfileUpdatePayloadSchema } from "../../../../shared/validation/profile";

describe("ProfileUpdatePayloadSchema", () => {
  it("accepts a valid payload and trims username", () => {
    const result = ProfileUpdatePayloadSchema.safeParse({
      username: "  jamie123  ",
      avatarPath: "  user-id/avatar.jpg  ",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.username).toBe("jamie123");
    expect(result.data.avatarPath).toBe("user-id/avatar.jpg");
  });

  it("accepts avatarPath as null for avatar removal", () => {
    const result = ProfileUpdatePayloadSchema.safeParse({ avatarPath: null });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.avatarPath).toBeNull();
  });

  it("rejects empty avatarPath string", () => {
    const result = ProfileUpdatePayloadSchema.safeParse({ avatarPath: "   " });

    expect(result.success).toBe(false);
  });

  it("enforces username min and max bounds", () => {
    const tooShort = ProfileUpdatePayloadSchema.safeParse({
      username: "a".repeat(PROFILE_NAME_MIN_LENGTH - 1),
    });
    const tooLong = ProfileUpdatePayloadSchema.safeParse({
      username: "a".repeat(PROFILE_NAME_MAX_LENGTH + 1),
    });

    expect(tooShort.success).toBe(false);
    if (!tooShort.success) {
      expect(tooShort.error.issues[0]?.message).toBe(
        `Must be at least ${PROFILE_NAME_MIN_LENGTH} characters`,
      );
    }

    expect(tooLong.success).toBe(false);
    if (!tooLong.success) {
      expect(tooLong.error.issues[0]?.message).toBe(
        `Must be ${PROFILE_NAME_MAX_LENGTH} characters or less`,
      );
    }
  });

  it("rejects unsupported username characters", () => {
    const result = ProfileUpdatePayloadSchema.safeParse({
      username: "user_name",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Can contain only lowercase letters and numbers",
      );
    }
  });

  it("rejects unknown keys", () => {
    const result = ProfileUpdatePayloadSchema.safeParse({
      username: "jamie",
      extra: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});
