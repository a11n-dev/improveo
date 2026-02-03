/**
 * PWA install composable.
 *
 * Provides browser/device detection, install flow helpers, and guide state.
 * Handles both native install prompt and manual guide for unsupported browsers.
 */

import type { Browser, DeviceType } from "~/types/pwa";

/** LocalStorage key for install opt-out flag */
const INSTALL_OPT_OUT_KEY = "pwa-install-opt-out";

/**
 * Detect browser from user agent.
 * Note: On iOS, all browsers use WebKit, so we detect iOS separately.
 */
const detectBrowser = (): Browser => {
  if (!import.meta.client) return "unknown";

  const ua = navigator.userAgent.toLowerCase();

  // Edge must be checked before Chrome (Edge UA contains "chrome")
  if (ua.includes("edg/") || ua.includes("edge/")) return "edge";

  // Chrome (but not Edge)
  if (ua.includes("chrome") && !ua.includes("edg")) return "chrome";

  // Firefox
  if (ua.includes("firefox")) return "firefox";

  // Safari (but not Chrome/Edge on macOS)
  if (ua.includes("safari") && !ua.includes("chrome")) return "safari";

  return "unknown";
};

/**
 * Detect if device is iOS (iPhone, iPad, iPod).
 * Also handles iPad on iOS 13+ which reports as Mac.
 */
const detectIsIOS = (): boolean => {
  if (!import.meta.client) return false;

  const ua = navigator.userAgent;

  // Standard iOS detection
  if (/iPad|iPhone|iPod/.test(ua)) return true;

  // iPad on iOS 13+ reports as Mac but has touch
  if (
    ua.includes("Mac") &&
    "ontouchend" in document &&
    navigator.maxTouchPoints > 1
  ) {
    return true;
  }

  return false;
};

/**
 * Detect device type (mobile vs desktop).
 * Tablets are treated as mobile for install instructions.
 */
const detectDevice = (): DeviceType => {
  if (!import.meta.client) return "desktop";

  const ua = navigator.userAgent.toLowerCase();

  // Mobile indicators
  const mobileKeywords = [
    "android",
    "webos",
    "iphone",
    "ipad",
    "ipod",
    "blackberry",
    "windows phone",
    "mobile",
    "tablet",
  ];

  if (mobileKeywords.some((keyword) => ua.includes(keyword))) {
    return "mobile";
  }

  // iPad on iOS 13+ detection (reports as Mac)
  if (
    navigator.userAgent.includes("Mac") &&
    "ontouchend" in document &&
    navigator.maxTouchPoints > 1
  ) {
    return "mobile";
  }

  return "desktop";
};

/**
 * Check if user has opted out of install prompts.
 */
const getOptOutStatus = (): boolean => {
  if (!import.meta.client) return false;

  try {
    return localStorage.getItem(INSTALL_OPT_OUT_KEY) === "true";
  } catch {
    // localStorage may be unavailable (private browsing, etc.)
    return false;
  }
};

/**
 * Set the opt-out flag in localStorage.
 */
const setOptOut = (): void => {
  if (!import.meta.client) return;

  try {
    localStorage.setItem(INSTALL_OPT_OUT_KEY, "true");
  } catch {
    // localStorage may be unavailable
  }
};

/** Shared guide open state across components */
const guideOpenState = () => useState<boolean>("pwa-guide-open", () => false);

/**
 * Shared opt-out state across components.
 * Initialized to false on SSR, synced from localStorage on client mount.
 */
const optOutState = () => useState<boolean>("pwa-install-opt-out", () => false);

export const usePwaInstall = () => {
  const { $pwa } = useNuxtApp();

  const isGuideOpen = guideOpenState();
  const isOptedOut = optOutState();

  // Detect browser and device (client-only, cached)
  const browser = detectBrowser();
  const device = detectDevice();
  const isIOS = detectIsIOS();

  // Sync opt-out state from localStorage on client mount
  onMounted(() => {
    isOptedOut.value = getOptOutStatus();
  });

  /** Whether PWA is not installed */
  const showInstallButton = computed(() => {
    return !$pwa?.isPWAInstalled;
  });

  /** Whether native install prompt is available */
  const canPromptInstall = computed(() => {
    return !!$pwa?.showInstallPrompt;
  });

  /** Whether the user has opted out of install prompts */
  const hasOptedOut = computed(() => {
    return isOptedOut.value;
  });

  /** Open the install guide overlay */
  const openGuide = () => {
    isGuideOpen.value = true;
  };

  /** Close the install guide overlay */
  const closeGuide = () => {
    isGuideOpen.value = false;
  };

  /**
   * Trigger installation.
   * Uses native prompt if available, otherwise opens guide.
   */
  const install = () => {
    if (canPromptInstall.value) {
      $pwa?.install();
    } else {
      openGuide();
    }
  };

  /**
   * Cancel installation and set opt-out flag.
   * Works for both native prompt and guide flow.
   * Sets localStorage flag for browsers without native prompt support.
   */
  const cancel = () => {
    closeGuide();

    // Always try to cancel via $pwa if available
    $pwa?.cancelInstall();

    // Also set our own opt-out flag for browsers without native prompt
    // This ensures the toast won't show again even if $pwa.cancelInstall() doesn't work
    setOptOut();
    isOptedOut.value = true;
  };

  return {
    browser,
    device,
    isIOS,
    isGuideOpen,
    showInstallButton,
    canPromptInstall,
    hasOptedOut,
    openGuide,
    closeGuide,
    install,
    cancel,
  };
};
