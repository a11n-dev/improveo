import { defineNotification } from "~/types/notifications";

export const notifications = {
  invalid_credentials: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Invalid or expired code",
      description: "Double-check the code or request a new one.",
    }),
  }),
  otp_disabled: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "OTP is disabled",
      description: "Email verification is currently unavailable.",
    }),
  }),
  otp_expired: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Invalid or expired code",
      description: "Double-check the code or request a new one.",
    }),
  }),
  over_email_send_rate_limit: defineNotification({
    defaultVariant: "warning",
    build: () => ({
      title: "Too many requests",
      description: "Please wait before requesting again.",
    }),
  }),
  over_request_rate_limit: defineNotification({
    defaultVariant: "warning",
    build: () => ({
      title: "Too many requests",
      description: "Please wait before requesting again.",
    }),
  }),
  resend_cooldown: defineNotification<{ seconds: number }>({
    defaultVariant: "warning",
    build: ({ seconds }) => ({
      title: "Please wait",
      description: `You can request a new code in ${seconds} seconds.`,
    }),
  }),
  signup_disabled: defineNotification({
    defaultVariant: "error",
    build: () => ({
      title: "Sign up is disabled",
      description: "Please try again later.",
    }),
  }),
} as const;
