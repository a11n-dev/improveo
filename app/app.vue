<script setup lang="ts">
const isDesktop = useIsDesktop();
const colorMode = useColorMode();

const themeColor = computed(() =>
  colorMode.value === "dark" ? "#020617" : "#ffffff",
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
      richColors: true,
      offset: 16,
    };
  }

  // Desktop: top-right instead of bottom-center
  return {
    position: "bottom-right" as const,
    expand: true,
    richColors: true,
  };
});
</script>
<template>
  <VitePwaManifest />

  <UApp :toaster="toasterConfig">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    
    <PwaNotifications />
  </UApp>
</template>
