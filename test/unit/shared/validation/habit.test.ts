import { describe, expect, it } from "vitest";

import { GOAL_COUNT_LIMITS } from "../../../../shared/constants/validation";
import {
  HabitCreatePayloadSchema,
  HabitGoalSchema,
  HabitUpdatePayloadSchema,
} from "../../../../shared/validation/habit";

const VALID_CREATE_PAYLOAD = {
  title: "Read 20 pages",
  description: "Before bed",
  icon: "i-lucide-book-open",
  color: "#3B82F6",
  goal: { periodType: "day" as const, targetCount: 1 },
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

    it("accepts a payload with null goal (no tracking)", () => {
      const result = HabitCreatePayloadSchema.safeParse({
        ...VALID_CREATE_PAYLOAD,
        goal: null,
      });

      expect(result.success).toBe(true);
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

    it("rejects unknown keys", () => {
      const result = HabitCreatePayloadSchema.safeParse({
        ...VALID_CREATE_PAYLOAD,
        extra: "unexpected",
      });

      expect(result.success).toBe(false);
    });
  });

  describe("HabitGoalSchema", () => {
    it.each([
      ["day", GOAL_COUNT_LIMITS.day + 1],
      ["week", GOAL_COUNT_LIMITS.week + 1],
      ["month", GOAL_COUNT_LIMITS.month + 1],
    ] as const)(
      "enforces max target count for %s period",
      (periodType, targetCount) => {
        const result = HabitGoalSchema.safeParse({
          periodType,
          targetCount,
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues[0]?.message).toContain(
            `Target count must be ${GOAL_COUNT_LIMITS[periodType]} or less`,
          );
        }
      },
    );

    it("requires positive target count", () => {
      const result = HabitGoalSchema.safeParse({
        periodType: "week",
        targetCount: 0,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.message).toBe(
          "Target count must be a positive integer",
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

    it("accepts goal update to null", () => {
      const result = HabitUpdatePayloadSchema.safeParse({
        goal: null,
      });

      expect(result.success).toBe(true);
    });

    it("accepts goal update with new values", () => {
      const result = HabitUpdatePayloadSchema.safeParse({
        goal: { periodType: "week", targetCount: 3 },
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
