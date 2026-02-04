<script setup lang="ts">
/**
 * Profile actions component.
 *
 * Provides account-related actions such as logout and PWA install.
 * Uses Supabase auth.signOut with global scope to terminate
 * all active sessions across devices.
 */

const supabaseClient = useSupabaseClient();
const { notifyError, notifySuccess } = useToastNotify();
const { install, showInstallButton } = usePwaInstall();

const isDeleting = ref(false);
const isDeleteOverlayOpen = ref(false);

/**
 * Handle logout action.
 *
 * Signs out from all sessions and redirects to auth page.
 * Uses global scope (default) to ensure complete signout
 * across all devices.
 */
const handleLogout = async (): Promise<void> => {
  const { error } = await supabaseClient.auth.signOut({ scope: "global" });

  if (error) {
    console.error("Logout error:", error);
    return;
  }

  await navigateTo("/auth", { replace: true });
};

/** Open delete confirmation overlay. */
const openDeleteOverlay = () => {
  isDeleteOverlayOpen.value = true;
};

/** Close delete confirmation overlay. */
const closeDeleteOverlay = () => {
  if (isDeleting.value) {
    return;
  }

  isDeleteOverlayOpen.value = false;
};

/** Confirm account deletion. */
const confirmDelete = async (): Promise<void> => {
  if (isDeleting.value) {
    return;
  }

  isDeleting.value = true;

  try {
    await $fetch("/api/profile", { method: "DELETE" });
    notifySuccess("Account deleted", "Your data has been removed.");
    isDeleteOverlayOpen.value = false;
    await supabaseClient.auth.signOut({ scope: "global" });
    await navigateTo("/auth", { replace: true });
  } catch {
    notifyError("Delete failed", "Please try again.");
  } finally {
    isDeleting.value = false;
  }
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
        :disabled="isDeleting"
        @click="install"
      >
        Install App
      </UButton>
    </ClientOnly>

    <!-- Logout button -->
    <UButton
      color="error"
      icon="i-lucide-log-out"
      variant="subtle"
      block
      :disabled="isDeleting"
      @click="handleLogout"
    >
      Log out
    </UButton>

    <!-- Delete account button -->
    <UButton
      color="error"
      icon="i-lucide-user-x"
      variant="outline"
      block
      :disabled="isDeleting"
      @click="openDeleteOverlay"
    >
      Delete account
    </UButton>

    <ResponsiveOverlay
      v-model:open="isDeleteOverlayOpen"
      title="Delete account"
      description="This action cannot be undone."
      :modal-props="{ close: false, ui: { footer: 'flex-col gap-2' } }"
      :drawer-props="{ close: false, ui: { footer: 'flex-col gap-2' } }"
    >
      <template #body>
        <p class="text-sm text-muted">
          Your account, profile, habits, and completions will be permanently
          deleted.
        </p>
      </template>
      <template #footer>
        <UButton
          color="error"
          icon="i-lucide-user-x"
          block
          :loading="isDeleting"
          :disabled="isDeleting"
          @click="confirmDelete"
        >
          Delete account
        </UButton>
        <UButton
          color="neutral"
          variant="subtle"
          block
          :disabled="isDeleting"
          @click="closeDeleteOverlay"
        >
          Cancel
        </UButton>
      </template>
    </ResponsiveOverlay>
  </div>
</template>
