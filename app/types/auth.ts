/** Authentication mode: login for existing users, register for new users. */
export type AuthMode = "login" | "register";

/** Authentication step: request for email entry, verify for OTP entry. */
export type AuthStep = "request" | "verify";
