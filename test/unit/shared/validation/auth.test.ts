import { describe, expect, it } from "vitest";

import {
  EMAIL_MAX_LENGTH,
  PROFILE_NAME_MAX_LENGTH,
  PROFILE_NAME_MIN_LENGTH,
} from "../../../../shared/constants/validation";
import {
  EmailSchema,
  UsernameSchema,
} from "../../../../shared/validation/auth";

describe("Auth validation schemas", () => {
  describe("EmailSchema", () => {
    it("normalizes valid email", () => {
      const result = EmailSchema.safeParse("  user@example.com ");

      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }

      expect(result.data).toBe("user@example.com");
    });

    it("rejects empty email", () => {
      const result = EmailSchema.safeParse("   ");

      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }

      expect(result.error.issues[0]?.message).toBe("Email is required");
    });

    it("rejects an email longer than configured max length", () => {
      const suffix = "@example.com";
      const tooLongEmail = `${"a".repeat(EMAIL_MAX_LENGTH - suffix.length + 1)}${suffix}`;

      const result = EmailSchema.safeParse(tooLongEmail);

      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }

      expect(result.error.issues[0]?.message).toBe(
        `Email must be ${EMAIL_MAX_LENGTH} characters or less`,
      );
    });

    it("rejects invalid email format", () => {
      const result = EmailSchema.safeParse("not-an-email");

      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }

      expect(result.error.issues[0]?.message).toBe(
        "Enter a valid email address.",
      );
    });
  });

  describe("UsernameSchema", () => {
    it("normalizes and accepts valid username", () => {
      const result = UsernameSchema.safeParse("  alex123  ");

      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }

      expect(result.data).toBe("alex123");
    });

    it("rejects empty username", () => {
      const result = UsernameSchema.safeParse("");

      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }

      expect(result.error.issues[0]?.message).toBe(
        `Must be at least ${PROFILE_NAME_MIN_LENGTH} characters`,
      );
    });

    it("enforces min and max bounds", () => {
      const tooShort = UsernameSchema.safeParse(
        "a".repeat(PROFILE_NAME_MIN_LENGTH - 1),
      );
      const tooLong = UsernameSchema.safeParse(
        "a".repeat(PROFILE_NAME_MAX_LENGTH + 1),
      );

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

    it("rejects special characters in username", () => {
      const result = UsernameSchema.safeParse("my_username");

      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }

      expect(result.error.issues[0]?.message).toBe(
        "Can contain only lowercase letters and numbers",
      );
    });

    it("rejects uppercase characters in username", () => {
      const result = UsernameSchema.safeParse("Alex123");

      expect(result.success).toBe(false);
      if (result.success) {
        return;
      }

      expect(result.error.issues[0]?.message).toBe(
        "Can contain only lowercase letters and numbers",
      );
    });
  });
});
