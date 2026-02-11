<script setup lang="ts">
const props = defineProps<{ profile: Profile }>();
const profileRef = toRef(props, "profile");

const {
  avatarAlt,
  avatarUrl,
  canSave,
  cancelDelete,
  confirmDelete,
  draftName,
  handleDelete: openDeleteConfirmation,
  hasUnsavedChanges,
  hasStoredAvatar,
  isDeleting,
  isSaving,
  markAvatarForRemoval,
  nameError,
  open,
  removeCurrentAvatar,
  resetDrafts,
  saveAccount,
  selectedAvatarFile,
  showDeleteConfirm,
} = useProfileAccountEditor(profileRef);
const { tap: tapHaptic } = useHaptics();

const {
  canRequestEmailChange,
  handleBack,
  isBusy: isEmailBusy,
  isEmailOverlayOpen,
  isRequesting,
  isVerifying,
  openOverlay: openEmailOverlay,
  otpValue,
  pendingEmail,
  requestEmailChange,
  resendSeconds,
  step,
  verifyCode,
} = useProfileEmailChange();

/**
 * Locks account editor actions while save/delete/email operations are pending.
 */
const isBusy = computed(
  () => isSaving.value || isDeleting.value || isEmailBusy.value,
);

const isSaveActionVisible = computed(
  () => (hasUnsavedChanges.value || isSaving.value) && !showDeleteConfirm.value,
);

const isEmailOverlayMounted = ref(false);

const handleOpenEmailOverlay = async () => {
  isEmailOverlayMounted.value = true;
  await nextTick();
  openEmailOverlay();
};

const handleEmailOverlayAfterLeave = () => {
  isEmailOverlayMounted.value = false;
};

const handleDeleteClick = () => {
  tapHaptic("base");
  openDeleteConfirmation();
};
</script>

<template>
  <div class="space-y-3">
    <!-- Account Trigger -->
    <ProfileSettingsField
      title="Account"
      description="Manage your profile details"
      icon="i-lucide-user-round"
      clickable
      show-chevron
      @click="open = true"
    />

    <!-- Account Editor -->
    <CommonOverlay
      v-model:open="open"
      title="Account"
      description="Update your name, email, and avatar"
      :modal-props="{ ui: { footer: 'flex-col gap-2' } }"
      :drawer-props="{ ui: { footer: 'flex-col gap-2' } }"
      @after:leave="resetDrafts"
    >
      <template #body>
        <div class="space-y-3">
          <!-- Avatar -->
          <ProfileSettingsAccountAvatarUpload
            v-model="selectedAvatarFile"
            :avatar-url="avatarUrl"
            :avatar-alt="avatarAlt"
            :has-stored-avatar="hasStoredAvatar"
            :remove-current-avatar="removeCurrentAvatar"
            :disabled="isBusy"
            @remove-avatar="markAvatarForRemoval"
          />

          <!-- Profile Form -->
          <ProfileSettingsAccountNameField
            v-model:name="draftName"
            :name-error="nameError"
            :disabled="isBusy"
          />

          <!-- Email Change -->
          <ProfileSettingsAccountEmailField
            :email="profile.email"
            :disabled="isBusy"
            @open="handleOpenEmailOverlay"
          />
        </div>
      </template>

      <template #footer>
        <CommonOverlayFooter
          :actions="[
            {
              type: 'confirm',
              color: 'danger',
              confirmText: 'Are you sure you want to delete your account?',
              confirmSubtext: 'This action cannot be undone.',
              visible: showDeleteConfirm,
              onConfirm: confirmDelete,
              onCancel: cancelDelete,
              loading: isDeleting,
            },
            {
              label: 'Delete account',
              color: 'danger',
              visible: !showDeleteConfirm,
              disabled: isSaving || isDeleting,
              onClick: handleDeleteClick,
            },
            {
              label: 'Save',
              color: 'primary',
              visible: isSaveActionVisible,
              loading: isSaving,
              disabled: !canSave,
              onClick: saveAccount,
            },
          ]"
        />
      </template>

      <!-- Email Verification Overlay -->
      <ProfileSettingsAccountEmailOverlay
        v-if="isEmailOverlayMounted"
        v-model:open="isEmailOverlayOpen"
        v-model:otp-value="otpValue"
        :current-email="profile.email"
        :pending-email="pendingEmail"
        :step="step"
        :can-request-email-change="canRequestEmailChange"
        :resend-seconds="resendSeconds"
        :is-requesting="isRequesting"
        :is-verifying="isVerifying"
        @request="requestEmailChange"
        @back="handleBack"
        @verify="verifyCode"
        @after:leave="handleEmailOverlayAfterLeave"
      />
    </CommonOverlay>
  </div>
</template>
