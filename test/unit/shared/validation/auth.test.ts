import { describe, expect, it } from "vitest";

import {
  EMAIL_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NAME_MIN_LENGTH,
} from "../../../../shared/constants/validation";
import {
  AuthLoginSchema,
  AuthRegisterSchema,
} from "../../../../shared/validation/auth";

describe("Auth validation schemas", () => {
  describe("AuthLoginSchema", () => {
    it("normalizes a valid login payload", () => {
      const result = AuthLoginSchema.safeParse({
        email: "  user@example.com ",
        name: "   ",
      });

      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }

      expect(result.data.email).toBe("user@example.com");
      expect(result.data.name).toBeUndefined();
    });

    it("rejects empty email", () => {
      const result = AuthLoginSchema.safeParse({
        email: "   ",
      });

      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }

      expect(result.error.issues[0]?.message).toBe("Email is required");
    });

    it("rejects an email longer than configured max length", () => {
      const suffix = "@example.com";
      const tooLongEmail = `${"a".repeat(EMAIL_MAX_LENGTH - suffix.length + 1)}${suffix}`;

      const result = AuthLoginSchema.safeParse({
        email: tooLongEmail,
      });

      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }

      expect(result.error.issues[0]?.message).toBe(
        `Email must be ${EMAIL_MAX_LENGTH} characters or less`,
      );
    });

    it("rejects unknown keys", () => {
      const result = AuthLoginSchema.safeParse({
        email: "user@example.com",
        extra: true,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("AuthRegisterSchema", () => {
    it("normalizes and accepts valid register payload", () => {
      const result = AuthRegisterSchema.safeParse({
        email: "  user@example.com ",
        name: "  Alex  ",
      });

      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }

      expect(result.data.email).toBe("user@example.com");
      expect(result.data.name).toBe("Alex");
    });

    it("requires name for registration", () => {
      const result = AuthRegisterSchema.safeParse({
        email: "user@example.com",
      });

      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }

      expect(result.error.issues[0]?.path).toEqual(["name"]);
    });

    it("enforces name min and max bounds", () => {
      const tooShort = AuthRegisterSchema.safeParse({
        email: "user@example.com",
        name: "a".repeat(PROFILE_NAME_MIN_LENGTH - 1),
      });
      const tooLong = AuthRegisterSchema.safeParse({
        email: "user@example.com",
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
  });
});
