<script setup lang="ts">
/**
 * PWA notifications component.
 *
 * Handles install prompts and update notifications via toast.
 * Uses usePwaInstall for unified install logic.
 */
const { $pwa } = useNuxtApp();
const toast = useToast();
const {
  install,
  cancel,
  canPromptInstall,
  showInstallButton,
  hasOptedOut,
  markInstallToastHandled,
} = usePwaInstall();

const createInstallToast = (primaryLabel: string) => {
  return {
    title: "Install Improveo",
    description: "Add to your home screen for quick access",
    color: "primary" as const,
    duration: 0,
    close: {
      onClick: () => {
        markInstallToastHandled();
      },
    },
    actions: [
      {
        label: primaryLabel,
        color: "primary" as const,
        size: "lg" as const,
        block: true,
        onClick: () => {
          markInstallToastHandled();
          install();
        },
      },
      {
        label: "Later",
        color: "neutral" as const,
        variant: "ghost" as const,
        size: "lg" as const,
        block: true,
        onClick: () => {
          markInstallToastHandled();
          cancel();
        },
      },
    ],
  };
};

/**
 * Show install prompt toast when native prompt is available.
 */
watch(
  () => $pwa?.showInstallPrompt,
  (showPrompt) => {
    if (showPrompt && showInstallButton.value && !hasOptedOut.value) {
      toast.add(createInstallToast("Install"));
    }
  },
  { immediate: true },
);

/**
 * Show install guide toast for browsers without native prompt.
 * Only shown once when:
 * - No native prompt available
 * - App not installed
 * - User hasn't opted out
 */
const hasShownGuideToast = ref(false);

/**
 * Show guide toast after a delay.
 * Uses nextTick to ensure opt-out state is synced from localStorage first.
 */
const showGuideToastIfNeeded = () => {
  if (
    !canPromptInstall.value &&
    showInstallButton.value &&
    !hasOptedOut.value &&
    !hasShownGuideToast.value
  ) {
    hasShownGuideToast.value = true;
    toast.add(createInstallToast("Show me how"));
  }
};

onMounted(async () => {
  // Wait for next tick to ensure usePwaInstall's onMounted has run
  // and synced the opt-out state from localStorage
  await nextTick();

  // Additional delay to avoid overwhelming user on page load
  setTimeout(showGuideToastIfNeeded, 2000);
});

/**
 * Update available toast.
 */
watch(
  () => $pwa?.needRefresh,
  (needsRefresh) => {
    if (needsRefresh) {
      toast.add({
        title: "Update available",
        description: "A new version is ready. Update now to continue.",
        color: "warning",
        duration: 0,
        actions: [
          {
            label: "Update now",
            color: "primary",
            size: "lg",
            block: true,
            onClick: () => {
              $pwa?.updateServiceWorker(true);
            },
          },
          {
            label: "Later",
            color: "neutral",
            variant: "ghost",
            size: "lg",
            block: true,
            onClick: () => {
              $pwa?.cancelPrompt();
            },
          },
        ],
      });
    }
  },
);
</script>

<template>
  <div aria-hidden="true" style="display: none" />
  <!-- PWA Install Guide overlay -->
  <PwaInstallGuide />
</template>
