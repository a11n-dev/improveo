import type { Ref } from "vue";

/** Authentication mode: login for existing users, register for new users. */
export type AuthMode = "login" | "register";

/** Authentication step: request for email entry, verify for OTP entry. */
export type AuthStep = "request" | "verify";

/** Options for requesting an email OTP via Supabase. */
export interface RequestOtpOptions {
  email: string;
  username?: string;
  shouldCreateUser: boolean;
}

/** Options for verifying an email OTP. */
export interface VerifyOtpOptions {
  email: string;
  token: string;
}

/** Return type for the useAuth composable. */
export interface UseAuthReturn {
  clearError: () => void;
  error: Ref<string | null>;
  isSending: Ref<boolean>;
  isVerifying: Ref<boolean>;
  requestOtp: (options: RequestOtpOptions) => Promise<boolean>;
  verifyOtp: (options: VerifyOtpOptions) => Promise<boolean>;
}
