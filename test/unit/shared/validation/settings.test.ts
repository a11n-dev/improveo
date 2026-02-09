import { describe, expect, it } from "vitest";

import { ProfileSettingsUpdatePayloadSchema } from "../../../../shared/validation/settings";

describe("ProfileSettingsUpdatePayloadSchema", () => {
  it("accepts a valid full payload", () => {
    const result = ProfileSettingsUpdatePayloadSchema.safeParse({
      colorMode: "dark",
      weekStart: 1,
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.colorMode).toBe("dark");
    expect(result.data.weekStart).toBe(1);
  });

  it("accepts colorMode alone", () => {
    const result = ProfileSettingsUpdatePayloadSchema.safeParse({
      colorMode: "light",
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.colorMode).toBe("light");
    expect(result.data.weekStart).toBeUndefined();
  });

  it("accepts weekStart alone", () => {
    const result = ProfileSettingsUpdatePayloadSchema.safeParse({
      weekStart: 3,
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      return;
    }

    expect(result.data.weekStart).toBe(3);
    expect(result.data.colorMode).toBeUndefined();
  });

  it("accepts system color mode", () => {
    const result = ProfileSettingsUpdatePayloadSchema.safeParse({
      colorMode: "system",
    });

    expect(result.success).toBe(true);
  });

  it.each(["light", "dark", "system"] as const)(
    "accepts valid colorMode: %s",
    (colorMode) => {
      const result = ProfileSettingsUpdatePayloadSchema.safeParse({
        colorMode,
      });

      expect(result.success).toBe(true);
    },
  );

  it("rejects invalid colorMode value", () => {
    const result = ProfileSettingsUpdatePayloadSchema.safeParse({
      colorMode: "auto",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Choose light, dark, or system",
      );
    }
  });

  it.each([-1, 7])("rejects weekStart out of range: %s", (weekStart) => {
    const result = ProfileSettingsUpdatePayloadSchema.safeParse({ weekStart });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Choose a day from Monday to Sunday",
      );
    }
  });

  it("requires weekStart to be an integer", () => {
    const result = ProfileSettingsUpdatePayloadSchema.safeParse({
      weekStart: 1.5,
    });

    expect(result.success).toBe(false);
  });

  it.each([0, 1, 2, 3, 4, 5, 6])(
    "accepts valid weekStart boundary: %s",
    (weekStart) => {
      const result = ProfileSettingsUpdatePayloadSchema.safeParse({
        weekStart,
      });

      expect(result.success).toBe(true);
    },
  );

  it("rejects unknown keys (strict mode)", () => {
    const result = ProfileSettingsUpdatePayloadSchema.safeParse({
      colorMode: "dark",
      extra: "unexpected",
    });

    expect(result.success).toBe(false);
  });

  it("accepts an empty object", () => {
    const result = ProfileSettingsUpdatePayloadSchema.safeParse({});

    expect(result.success).toBe(true);
  });
});
