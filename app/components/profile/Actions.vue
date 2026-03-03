<script setup lang="ts">
const { install, showInstallButton } = usePwaInstall();
const { signOut } = useSignOut();

/** Signs the user out and redirects to the auth page. */
const handleLogout = async (): Promise<void> => {
  await signOut();
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <ClientOnly>
      <UButton
        v-if="showInstallButton"
        color="primary"
        icon="i-lucide-download"
        block
        @click="install"
      >
        Install app
      </UButton>
    </ClientOnly>

    <UButton color="error" icon="i-lucide-log-out" block @click="handleLogout">
      Log out
    </UButton>
  </div>
</template>
