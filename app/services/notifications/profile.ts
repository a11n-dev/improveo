import { defineNotification } from "~/types/notifications";

export const notifications = {
  account_deleted: defineNotification({
    defaultVariant: "success",
    build: () => ({
      title: "Account deleted",
      description: "Your data has been removed.",
    }),
  }),
  account_updated: defineNotification({
    defaultVariant: "success",
    build: () => ({
      title: "Account updated",
      description: "Your profile changes were saved.",
    }),
  }),
  avatar_cleanup_failed: defineNotification({
    defaultVariant: "warning",
    build: () => ({
      title: "Avatar cleanup failed",
      description: "Please try again.",
    }),
  }),
  delete_failed: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Delete failed",
      description: "Please try again.",
    }),
  }),
  email_update_failed: defineNotification<{ message: string }>({
    defaultVariant: "error",
    build: ({ message }) => ({
      title: "Email update failed",
      description: message,
    }),
  }),
  email_updated: defineNotification({
    defaultVariant: "success",
    build: () => ({
      title: "Email updated",
      description: "Your new email is now active.",
    }),
  }),
  invalid_code: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Invalid code",
      description: "Enter the 6-digit code from your email.",
    }),
  }),
  missing_email: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Missing email",
      description: "Restart email change and try again.",
    }),
  }),
  update_failed: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Update failed",
      description: "Please try again.",
    }),
  }),
  update_failed_with_message: defineNotification<{ message: string }>({
    defaultVariant: "error",
    build: ({ message }) => ({
      title: "Update failed",
      description: message,
    }),
  }),
  verification_failed: defineNotification<{ message: string }>({
    defaultVariant: "error",
    build: ({ message }) => ({
      title: "Verification failed",
      description: message,
    }),
  }),
} as const;
