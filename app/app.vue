<script setup lang="ts">
const isMounted = ref(false);
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

onMounted(() => {
  isMounted.value = true;
});

const toasterConfig = computed(() => {
  const shouldUseDesktop = isMounted.value && isDesktop.value;

  if (!shouldUseDesktop) {
    return {
      position: "bottom-center" as const,
      expand: false,
      richColors: true,
      offset: 16,
    };
  }

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
