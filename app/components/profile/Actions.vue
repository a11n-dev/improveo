<script setup lang="ts">
const supabaseClient = useSupabaseClient();
const { notifyError } = useToastNotify();
const { install, showInstallButton } = usePwaInstall();

/**
 * Handle logout action.
 */
const handleLogout = async (): Promise<void> => {
  const { error } = await supabaseClient.auth.signOut({ scope: "global" });

  if (error) {
    notifyError("Logout failed", "Please try again.");
    return;
  }

  await navigateTo("/auth", { replace: true });
};
</script>

<template>
  <div class="flex flex-col gap-2">
    <!-- Install PWA button (shown when not installed) -->
    <ClientOnly>
      <UButton
        v-if="showInstallButton"
        color="primary"
        icon="i-lucide-download"
        variant="subtle"
        block
        @click="install"
      >
        Install app
      </UButton>
    </ClientOnly>

    <!-- Logout button -->
    <UButton
      color="error"
      icon="i-lucide-log-out"
      variant="subtle"
      block
      @click="handleLogout"
    >
      Log out
    </UButton>
  </div>
</template>
