/**
 * Joins OTP digit values into a normalized token string.
 */
export const joinOtpDigits = (digits: (number | string)[]): string => {
  return digits.map(String).join("").trim();
};
