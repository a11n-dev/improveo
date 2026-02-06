import { describe, expect, it } from "vitest";

import { STREAK_COUNT_LIMITS } from "../../../../shared/constants/validation";
import {
  HabitCreatePayloadSchema,
  HabitStreakSchema,
  HabitUpdatePayloadSchema,
} from "../../../../shared/validation/habit";

const VALID_CREATE_PAYLOAD = {
  title: "Read 20 pages",
  description: "Before bed",
  icon: "i-lucide-book-open",
  color: "#3B82F6",
  streakInterval: "daily" as const,
  streakCount: 1,
};

describe("Habit validation schemas", () => {
  describe("HabitCreatePayloadSchema", () => {
    it("accepts a valid payload and trims title", () => {
      const result = HabitCreatePayloadSchema.safeParse({
        ...VALID_CREATE_PAYLOAD,
        title: "  Read 20 pages  ",
      });

      expect(result.success).toBe(true);
      if (!result.success) {
        return;
      }

      expect(result.data.title).toBe("Read 20 pages");
    });

    it("requires title", () => {
      const result = HabitCreatePayloadSchema.safeParse({
        ...VALID_CREATE_PAYLOAD,
        title: "   ",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe("Title is required");
      }
    });

    it("rejects invalid icon and color formats", () => {
      const iconResult = HabitCreatePayloadSchema.safeParse({
        ...VALID_CREATE_PAYLOAD,
        icon: "lucide-book",
      });
      const colorResult = HabitCreatePayloadSchema.safeParse({
        ...VALID_CREATE_PAYLOAD,
        color: "#fff",
      });

      expect(iconResult.success).toBe(false);
      if (!iconResult.success) {
        expect(iconResult.error.issues[0]?.message).toBe(
          "Icon format is invalid",
        );
      }

      expect(colorResult.success).toBe(false);
      if (!colorResult.success) {
        expect(colorResult.error.issues[0]?.message).toBe(
          "Color format is invalid",
        );
      }
    });

    it("enforces streak rule when interval is disabled", () => {
      const result = HabitCreatePayloadSchema.safeParse({
        ...VALID_CREATE_PAYLOAD,
        streakInterval: null,
        streakCount: 1,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Streak count must be 0 when streak interval is disabled",
        );
      }
    });

    it("rejects unknown keys", () => {
      const result = HabitCreatePayloadSchema.safeParse({
        ...VALID_CREATE_PAYLOAD,
        extra: "unexpected",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("HabitStreakSchema", () => {
    it.each([
      ["daily", STREAK_COUNT_LIMITS.daily + 1],
      ["weekly", STREAK_COUNT_LIMITS.weekly + 1],
      ["monthly", STREAK_COUNT_LIMITS.monthly + 1],
    ] as const)(
      "enforces max count for %s interval",
      (streakInterval, streakCount) => {
        const result = HabitStreakSchema.safeParse({
          streakInterval,
          streakCount,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain(
            `Streak count must be ${STREAK_COUNT_LIMITS[streakInterval]} or less`,
          );
        }
      },
    );

    it("requires positive count when interval is enabled", () => {
      const result = HabitStreakSchema.safeParse({
        streakInterval: "weekly",
        streakCount: 0,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Streak count must be a positive integer",
        );
      }
    });
  });

  describe("HabitUpdatePayloadSchema", () => {
    it("accepts partial updates", () => {
      const result = HabitUpdatePayloadSchema.safeParse({
        title: "New title",
      });

      expect(result.success).toBe(true);
    });

    it("rejects unknown keys", () => {
      const result = HabitUpdatePayloadSchema.safeParse({
        title: "New title",
        extra: true,
      });

      expect(result.success).toBe(false);
    });
  });
});
