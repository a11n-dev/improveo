<script setup lang="ts">
const { $pwa } = useNuxtApp();
const toast = useToast();

// Install prompt toast
watch(
  () => $pwa?.showInstallPrompt,
  (showPrompt) => {
    if (showPrompt && !$pwa?.isPWAInstalled) {
      toast.add({
        title: "Install Improveme",
        description: "Add to your home screen for quick access",
        color: "primary",
        duration: 0,
        actions: [
          {
            label: "Install",
            color: "primary",
            variant: "subtle",
            size: "lg",
            block: true,
            onClick: () => {
              $pwa?.install();
            },
          },
          {
            label: "Later",
            color: "neutral",
            variant: "ghost",
            size: "lg",
            block: true,
            onClick: () => {
              $pwa?.cancelInstall();
            },
          },
        ],
      });
    }
  },
  { immediate: true },
);

// Offline ready toast
watch(
  () => $pwa?.offlineReady,
  (isOfflineReady) => {
    if (isOfflineReady) {
      toast.add({
        title: "Offline Ready",
        description: "App is ready to work offline",
        color: "success",
        duration: 3000,
      });
    }
  },
);

// Update available toast
watch(
  () => $pwa?.needRefresh,
  (needsRefresh) => {
    if (needsRefresh) {
      toast.add({
        title: "Update Available",
        description: "A new version is available. Click to update.",
        color: "warning",
        duration: 0,
        actions: [
          {
            label: "Update Now",
            color: "primary",
            variant: "subtle",
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
  <div
    aria-hidden="true"
    style="display: none"
  />
</template>
