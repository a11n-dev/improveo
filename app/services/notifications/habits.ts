import { defineNotification } from "~/types/notifications";

export const notifications = {
  completion_update_failed: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Failed to update completion",
      description: "Please try again.",
    }),
  }),
  create_failed: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Failed to create habit",
      description: "Please try again.",
    }),
  }),
  delete_failed: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Failed to delete habit",
      description: "Please try again.",
    }),
  }),
  not_found: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Habit not found",
      description: "Could not find the habit.",
    }),
  }),
  update_failed: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Failed to update habit",
      description: "Please try again.",
    }),
  }),
} as const;
