<script setup lang="ts">
const toasterConfig = computed(() => {
  if (!useIsDesktop().value) {
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
  <UApp :toaster="toasterConfig">
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </UApp>
</template>
