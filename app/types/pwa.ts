/**
 * PWA-related type definitions.
 */

/** Supported browsers for install guides */
export type Browser = "chrome" | "safari" | "edge" | "firefox" | "unknown";

/** Device categories (tablets treated as mobile) */
export type DeviceType = "mobile" | "desktop";

/** Single step in the PWA install guide */
export interface InstallStep {
  title: string;
  subtitle: string;
  icon: string;
}

/** Complete install guide for a browser/device combination */
export interface InstallGuide {
  title: string;
  subtitle: string;
  headerIcon: string;
  steps: readonly InstallStep[];
}
