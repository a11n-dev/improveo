import { defineNotification } from "~/types/notifications";

export const notifications = {
  account_not_found: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Account not found",
      description: "No account found. Please register first.",
    }),
  }),
  invalid_or_expired_code: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Invalid or expired code",
      description: "Double-check the code or request a new one.",
    }),
  }),
} as const;
