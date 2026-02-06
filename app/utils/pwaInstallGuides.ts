/**
 * PWA install guide instructions data.
 *
 * Contains browser-specific and device-specific installation steps.
 */

import type { Browser, DeviceType, InstallGuide } from "~/types/pwa";

/**
 * Get the appropriate install guide based on browser, device, and iOS status.
 */
export const getInstallGuide = (
  browser: Browser,
  device: DeviceType,
  isIOS: boolean,
): InstallGuide => {
  // iOS mobile/tablet: always use iOS guide (all browsers use WebKit)
  if (isIOS && device === "mobile") {
    return guides.ios;
  }

  // Desktop or non-iOS mobile: use browser-specific guide
  const key = `${browser}.${device}` as keyof typeof guides;
  return guides[key] ?? guides["chrome.desktop"];
};

const guides = {
  /** iOS (all browsers on mobile/tablet) */
  ios: {
    title: "iOS",
    subtitle: "Mobile/Tablet",
    headerIcon: "i-lucide-smartphone",
    steps: [
      {
        title: "Tap the Share button",
        subtitle: "Find the share icon at the bottom of the screen",
        icon: "i-lucide-share",
      },
      {
        title: 'Scroll and tap "Add to Home Screen"',
        subtitle: "You may need to scroll down in the share menu",
        icon: "i-lucide-plus-square",
      },
      {
        title: 'Tap "Add"',
        subtitle: "Confirm to add the app to your home screen",
        icon: "i-lucide-check",
      },
    ],
  },

  /** Safari on macOS desktop */
  "safari.desktop": {
    title: "Safari",
    subtitle: "macOS Desktop",
    headerIcon: "i-lucide-monitor",
    steps: [
      {
        title: "Click the Share button",
        subtitle: "Find it in the Safari toolbar",
        icon: "i-lucide-share",
      },
      {
        title: 'Click "Add to Dock"',
        subtitle: "Select this option from the share menu",
        icon: "i-lucide-layout-grid",
      },
      {
        title: 'Click "Add"',
        subtitle: "Confirm to add the app to your Dock",
        icon: "i-lucide-check",
      },
    ],
  },

  /** Chrome on Android mobile */
  "chrome.mobile": {
    title: "Chrome",
    subtitle: "Android Mobile",
    headerIcon: "i-lucide-smartphone",
    steps: [
      {
        title: "Tap the menu icon",
        subtitle: "Three dots in the top-right corner",
        icon: "i-lucide-more-vertical",
      },
      {
        title: 'Tap "Install app" or "Add to Home screen"',
        subtitle: "Look for the install option in the menu",
        icon: "i-lucide-download",
      },
      {
        title: 'Tap "Install"',
        subtitle: "Confirm to add the app",
        icon: "i-lucide-check",
      },
    ],
  },

  /** Chrome on desktop */
  "chrome.desktop": {
    title: "Chrome",
    subtitle: "Desktop Browser",
    headerIcon: "i-lucide-monitor",
    steps: [
      {
        title: "Look for the install icon",
        subtitle: "Find it in the address bar (right side)",
        icon: "i-lucide-monitor-down",
      },
      {
        title: "Click the install icon",
        subtitle: 'Or use menu → "Install Improveo..."',
        icon: "i-lucide-mouse-pointer-click",
      },
      {
        title: 'Click "Install"',
        subtitle: "The app will open in its own window",
        icon: "i-lucide-check",
      },
    ],
  },

  /** Edge on mobile */
  "edge.mobile": {
    title: "Microsoft Edge",
    subtitle: "Mobile Browser",
    headerIcon: "i-lucide-smartphone",
    steps: [
      {
        title: "Tap the menu icon",
        subtitle: "Three dots at the bottom of the screen",
        icon: "i-lucide-more-horizontal",
      },
      {
        title: 'Tap "Add to phone"',
        subtitle: "Look for this option in the menu",
        icon: "i-lucide-smartphone",
      },
      {
        title: 'Tap "Install"',
        subtitle: "Confirm to add the app to your home screen",
        icon: "i-lucide-check",
      },
    ],
  },

  /** Edge on desktop */
  "edge.desktop": {
    title: "Microsoft Edge",
    subtitle: "Desktop Browser",
    headerIcon: "i-lucide-monitor",
    steps: [
      {
        title: "Look for the install icon",
        subtitle: "Find it in the address bar (right side)",
        icon: "i-lucide-monitor-down",
      },
      {
        title: "Click the install icon",
        subtitle: 'Or use menu → Apps → "Install Improveo"',
        icon: "i-lucide-mouse-pointer-click",
      },
      {
        title: 'Click "Install"',
        subtitle: "The app will be added to your system",
        icon: "i-lucide-check",
      },
    ],
  },

  /** Firefox on mobile */
  "firefox.mobile": {
    title: "Firefox",
    subtitle: "Mobile Browser",
    headerIcon: "i-lucide-smartphone",
    steps: [
      {
        title: "Tap the menu icon",
        subtitle: "Three dots in the bottom-right corner",
        icon: "i-lucide-more-vertical",
      },
      {
        title: 'Tap "Install"',
        subtitle: "Look for the install option in the menu",
        icon: "i-lucide-download",
      },
      {
        title: "Confirm installation",
        subtitle: 'Tap "Add" to add to your home screen',
        icon: "i-lucide-check",
      },
    ],
  },

  /** Firefox on desktop (limited support) */
  "firefox.desktop": {
    title: "Firefox",
    subtitle: "Desktop Browser",
    headerIcon: "i-lucide-monitor",
    steps: [
      {
        title: "Firefox has limited PWA support",
        subtitle: "Desktop PWA installation is not natively supported",
        icon: "i-lucide-info",
      },
      {
        title: "Try using Chrome or Edge",
        subtitle: "These browsers have full PWA support",
        icon: "i-lucide-globe",
      },
      {
        title: "Or bookmark this page",
        subtitle: "Press Ctrl+D (Cmd+D on Mac) to bookmark",
        icon: "i-lucide-bookmark",
      },
    ],
  },

  /** Unknown browser on mobile */
  "unknown.mobile": {
    title: "Browser",
    subtitle: "Mobile",
    headerIcon: "i-lucide-smartphone",
    steps: [
      {
        title: "Open browser menu",
        subtitle: "Usually three dots or lines icon",
        icon: "i-lucide-menu",
      },
      {
        title: 'Look for "Install" or "Add to Home Screen"',
        subtitle: "The option may vary by browser",
        icon: "i-lucide-download",
      },
      {
        title: "Confirm installation",
        subtitle: "Follow the prompts to complete",
        icon: "i-lucide-check",
      },
    ],
  },

  /** Unknown browser on desktop */
  "unknown.desktop": {
    title: "Browser",
    subtitle: "Desktop",
    headerIcon: "i-lucide-monitor",
    steps: [
      {
        title: "Look for install option",
        subtitle: "Check the address bar or browser menu",
        icon: "i-lucide-monitor-down",
      },
      {
        title: "Try Chrome or Edge for best support",
        subtitle: "These browsers have full PWA support",
        icon: "i-lucide-globe",
      },
      {
        title: "Or bookmark this page",
        subtitle: "Press Ctrl+D (Cmd+D on Mac) to bookmark",
        icon: "i-lucide-bookmark",
      },
    ],
  },
} as const;
