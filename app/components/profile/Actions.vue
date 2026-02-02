<script setup lang="ts">
/**
 * Profile actions component.
 *
 * Provides account-related actions such as logout.
 * Uses Supabase auth.signOut with global scope to terminate
 * all active sessions across devices.
 */

const supabaseClient = useSupabaseClient();

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
</script>

<template>
  <UButton
    color="error"
    icon="i-lucide-log-out"
    variant="subtle"
    block
    @click="handleLogout"
  >
    Log out
  </UButton>
</template>
