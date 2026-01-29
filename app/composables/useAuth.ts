import type {
  RequestOtpOptions,
  UseAuthReturn,
  VerifyOtpOptions,
} from "~/types/auth";

/**
 * Supabase email OTP authentication composable.
 *
 * Provides methods for requesting and verifying OTP codes, along with
 * reactive state for tracking loading and error conditions. Displays
 * toast notifications for user feedback on errors.
 *
 * @returns Authentication state and methods for OTP-based auth flow.
 */
export const useAuth = (): UseAuthReturn => {
  const supabaseClient = useSupabaseClient();
  const { notifyError } = useToastNotify();

  const isSending = ref(false);
  const isVerifying = ref(false);
  const error = ref<string | null>(null);

  /**
   * Displays a user-friendly toast for OTP request errors.
   * Handles known Supabase error patterns with specific messaging.
   * @param message - The raw error message from Supabase.
   */
  const notifyRequestError = (message: string): void => {
    if (/signups not allowed/i.test(message)) {
      notifyError(
        "Account not found",
        "No account found. Please register first.",
      );
      return;
    }

    notifyError("Unable to send code", message);
  };

  /**
   * Displays a user-friendly toast for OTP verification errors.
   * Handles expired and invalid token patterns with specific messaging.
   * @param message - The raw error message from Supabase.
   */
  const notifyOtpError = (message: string): void => {
    if (/expired/i.test(message)) {
      notifyError("Code expired", "Request a new code and try again.");
      return;
    }

    if (/invalid|token/i.test(message)) {
      notifyError(
        "Invalid code",
        "Double-check the code or request a new one.",
      );
      return;
    }

    notifyError("Verification failed", message);
  };

  /**
   * Clears the current auth error message.
   */
  const clearError = (): void => {
    error.value = null;
  };

  /**
   * Requests an email OTP from Supabase.
   *
   * Validates the email, sends the OTP request, and handles errors with
   * appropriate toast notifications. Sets `isSending` to true during the request.
   *
   * @param options - The OTP request options.
   * @param options.email - The user's email address.
   * @param options.name - Optional display name for registration.
   * @param options.shouldCreateUser - Whether to create a new user if not found.
   * @returns `true` if the OTP was sent successfully, `false` otherwise.
   */
  const requestOtp = async ({
    email,
    name,
    shouldCreateUser,
  }: RequestOtpOptions): Promise<boolean> => {
    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      const message = "Email is required.";
      error.value = message;
      notifyError("Email required", message);
      return false;
    }

    isSending.value = true;
    error.value = null;

    const signInOptions: {
      shouldCreateUser: boolean;
      data?: { name: string };
    } = { shouldCreateUser };

    const normalizedName = name?.trim();
    if (normalizedName) {
      signInOptions.data = { name: normalizedName };
    }

    const { error: supabaseError } = await supabaseClient.auth.signInWithOtp({
      email: normalizedEmail,
      options: signInOptions,
    });

    isSending.value = false;

    if (supabaseError) {
      error.value = supabaseError.message;
      notifyRequestError(supabaseError.message);
      return false;
    }

    return true;
  };

  /**
   * Verifies a 6-character OTP for the given email.
   *
   * Validates inputs, submits verification to Supabase, and handles errors
   * with appropriate toast notifications. Sets `isVerifying` to true during
   * the request.
   *
   * @param options - The OTP verification options.
   * @param options.email - The user's email address.
   * @param options.token - The 6-character OTP token.
   * @returns `true` if verification succeeded, `false` otherwise.
   */
  const verifyOtp = async ({
    email,
    token,
  }: VerifyOtpOptions): Promise<boolean> => {
    const normalizedEmail = email.trim();
    const normalizedToken = token.replace(/\s/g, "");

    if (!normalizedEmail) {
      const message = "Email is required.";
      error.value = message;
      notifyError("Email required", message);
      return false;
    }

    if (normalizedToken.length !== 6) {
      const message = "OTP must be 6 characters.";
      error.value = message;
      notifyError("Invalid code", message);
      return false;
    }

    isVerifying.value = true;
    error.value = null;

    const { error: supabaseError } = await supabaseClient.auth.verifyOtp({
      email: normalizedEmail,
      token: normalizedToken,
      type: "email",
    });

    isVerifying.value = false;

    if (supabaseError) {
      error.value = supabaseError.message;
      notifyOtpError(supabaseError.message);
      return false;
    }

    return true;
  };

  return {
    clearError,
    error,
    isSending,
    isVerifying,
    requestOtp,
    verifyOtp,
  };
};
