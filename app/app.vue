<script setup lang="ts">
const isDesktop = useIsDesktop();
const colorMode = useColorMode();

const themeColor = computed(() =>
  colorMode.value === "dark" ? "#0f172a" : "#ffffff",
);

useHead({
  meta: [
    {
      name: "theme-color",
      content: themeColor,
    },
  ],
});

const toasterConfig = computed(() => {
  if (!isDesktop.value) {
    return {
      position: "bottom-center" as const,
      expand: false,
      duration: 3000,
      ui: { viewport: "bottom-8" },
    };
  }

  // Desktop: top-right instead of bottom-center
  return {
    position: "bottom-right" as const,
    expand: false,
    duration: 3000,
  };
});
</script>
<template>
  <VitePwaManifest />

  <ClientOnly>
    <Teleport to="body">
      <div class="statusbar-probe" aria-hidden="true" />
    </Teleport>
  </ClientOnly>

  <UApp :toaster="toasterConfig">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>

    <PwaNotifications />
  </UApp>
</template>
