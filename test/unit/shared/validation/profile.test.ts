import { describe, expect, it } from "vitest";

import {
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NAME_MIN_LENGTH,
} from "../../../../shared/constants/validation";
import { ProfileUpdatePayloadSchema } from "../../../../shared/validation/profile";

describe("ProfileUpdatePayloadSchema", () => {
  it("accepts a valid payload and trims name", () => {
    const result = ProfileUpdatePayloadSchema.safeParse({
      name: "  Jamie  ",
      weekStart: 1,
      avatarPath: "  user-id/avatar.jpg  ",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.name).toBe("Jamie");
    expect(result.data.weekStart).toBe(1);
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

  it("enforces name min and max bounds", () => {
    const tooShort = ProfileUpdatePayloadSchema.safeParse({
      name: "a".repeat(PROFILE_NAME_MIN_LENGTH - 1),
    });
    const tooLong = ProfileUpdatePayloadSchema.safeParse({
      name: "a".repeat(PROFILE_NAME_MAX_LENGTH + 1),
    });

    expect(tooShort.success).toBe(false);
    if (!tooShort.success) {
      expect(tooShort.error.issues[0]?.message).toBe(
        `Name must be at least ${PROFILE_NAME_MIN_LENGTH} characters`,
      );
    }

    expect(tooLong.success).toBe(false);
    if (!tooLong.success) {
      expect(tooLong.error.issues[0]?.message).toBe(
        `Name must be ${PROFILE_NAME_MAX_LENGTH} characters or less`,
      );
    }
  });

  it.each([-1, 7])("rejects weekStart out of range: %s", (weekStart) => {
    const result = ProfileUpdatePayloadSchema.safeParse({ weekStart });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Choose a day from Monday to Sunday",
      );
    }
  });

  it("requires weekStart to be an integer", () => {
    const result = ProfileUpdatePayloadSchema.safeParse({ weekStart: 1.5 });

    expect(result.success).toBe(false);
  });

  it("rejects unknown keys", () => {
    const result = ProfileUpdatePayloadSchema.safeParse({
      name: "Jamie",
      extra: "unexpected",
    });

    expect(result.success).toBe(false);
  });
});
