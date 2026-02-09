import { z } from "zod";

const ColorModeSchema = z.enum(["light", "dark", "system"], {
  message: "Choose light, dark, or system",
});

const WeekStartSchema = z
  .number()
  .int()
  .min(0, "Choose a day from Monday to Sunday")
  .max(6, "Choose a day from Monday to Sunday");

export const ProfileSettingsUpdatePayloadSchema = z
  .object({
    colorMode: ColorModeSchema.optional(),
    weekStart: WeekStartSchema.optional(),
  })
  .strict();

export type ProfileSettingsUpdateInput = z.infer<
  typeof ProfileSettingsUpdatePayloadSchema
>;
