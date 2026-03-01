<script setup lang="ts">
const profileStore = useProfileStore();
const { notifyMessage } = useNotify();
const supabaseClient = useSupabaseClient();
const { profile } = storeToRefs(profileStore);

const isConfirmOpen = ref(false);
const isDeleting = ref(false);

const canDeleteAccount = computed(
  () => profile.value !== null && !isDeleting.value,
);

/**
 * Permanently deletes the current account, signs the user out, and redirects.
 *
 * Confirmation UI is handled by the surrounding popover.
 */
const handleDeleteAccount = async (): Promise<void> => {
  if (!canDeleteAccount.value) {
    return;
  }

  isDeleting.value = true;

  try {
    const isDeleted = await profileStore.deleteProfile();

    if (!isDeleted) {
      notifyMessage({ scope: "profile", code: "delete_failed" });
      return;
    }

    notifyMessage({ scope: "profile", code: "account_deleted" });
    isConfirmOpen.value = false;

    await supabaseClient.auth.signOut({ scope: "global" });
    await navigateTo("/auth", { replace: true });
  } finally {
    isDeleting.value = false;
  }
};
</script>

<template>
  <UPopover
    v-model:open="isConfirmOpen"
    :disabled="!canDeleteAccount"
    arrow
    :content="{ side: 'top', sideOffset: 8 }"
    :ui="{ content: 'z-110' }"
  >
    <UButton
      label="Delete account"
      color="error"
      variant="subtle"
      block
      :disabled="!canDeleteAccount"
    />

    <template #content>
      <div class="w-80 space-y-4 p-4">
        <p class="text-sm font-semibold text-highlighted">Delete Account?</p>
        <p class="text-sm text-muted">
          Deleting your account is permanent. You will immediately lose access
          to all your data. Are you sure?
        </p>

        <div class="flex items-center gap-2">
          <UButton
            label="Cancel"
            color="neutral"
            variant="ghost"
            block
            class="flex-1"
            :disabled="isDeleting"
            @click="isConfirmOpen = false"
          />
          <UButton
            label="Delete"
            color="error"
            block
            class="flex-1"
            :loading="isDeleting"
            :disabled="!canDeleteAccount"
            @click="handleDeleteAccount"
          />
        </div>
      </div>
    </template>
  </UPopover>
</template>
