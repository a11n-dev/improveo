import { defineNotification } from "~/types/notifications";

export const notifications = {
  invalid_value: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Invalid value",
      description: "Choose a day from Monday to Sunday",
    }),
  }),
  update_failed: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Update failed",
      description: "Please try again.",
    }),
  }),
} as const;
