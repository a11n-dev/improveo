import type { Ref } from "vue";

/** Authentication mode: login for existing users, register for new users. */
export type AuthMode = "login" | "register";

/** Authentication step: request for email entry, verify for OTP entry. */
export type AuthStep = "request" | "verify";

/** Options for requesting an email OTP via Supabase. */
export interface RequestOtpOptions {
  /** The user's email address. */
  email: string;
  /** Optional display name for new user registration. */
  name?: string;
  /** Whether to create a new user if one doesn't exist. */
  shouldCreateUser: boolean;
}

/** Options for verifying an email OTP. */
export interface VerifyOtpOptions {
  /** The user's email address. */
  email: string;
  /** The 6-character OTP token received via email. */
  token: string;
}

/** Return type for the useAuth composable. */
export interface UseAuthReturn {
  /** Clears the current auth error message. */
  clearError: () => void;
  /** The current error message, or null if no error. */
  error: Ref<string | null>;
  /** Whether an OTP request is in progress. */
  isSending: Ref<boolean>;
  /** Whether OTP verification is in progress. */
  isVerifying: Ref<boolean>;
  /** Request an OTP for the given email. */
  requestOtp: (options: RequestOtpOptions) => Promise<boolean>;
  /** Verify an OTP for the given email. */
  verifyOtp: (options: VerifyOtpOptions) => Promise<boolean>;
}
