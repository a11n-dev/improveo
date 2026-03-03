/**
 * Joins OTP digit values into a normalized token string.
 *
 * @param digits PIN digits from UI model.
 * @returns Trimmed OTP token.
 */
export const joinOtpDigits = (digits: (number | string)[]): string => {
  return digits.map(String).join("").trim();
};
