<script setup lang="ts">
const supabaseClient = useSupabaseClient();
const { notifyMessage } = useNotify();
const { install, showInstallButton } = usePwaInstall();

/** Signs the user out and redirects to the auth page. */
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
