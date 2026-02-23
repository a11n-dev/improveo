<script setup lang="ts">
const supabaseClient = useSupabaseClient();
const { notifyMessage } = useNotify();
const { install, showInstallButton } = usePwaInstall();

/**
 * Handle logout action.
 */
const handleLogout = async (): Promise<void> => {
  const { error } = await supabaseClient.auth.signOut({ scope: "global" });

  if (error) {
    notifyMessage({ scope: "auth", code: "logout_failed" });
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
        block
        @click="install"
      >
        Install app
      </UButton>
    </ClientOnly>

    <!-- Logout button -->
    <UButton color="error" icon="i-lucide-log-out" block @click="handleLogout">
      Log out
    </UButton>
  </div>
</template>
