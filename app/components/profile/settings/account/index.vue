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
  handleDelete,
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

const {
  canRequestEmailChange,
  handleBack,
  isBusy: isEmailBusy,
  isEmailOverlayOpen,
  isRequesting,
  isVerifying,
  openOverlay,
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
</script>

<template>
  <div class="space-y-3">
    <!-- Account Trigger -->
    <ProfileSettingsField
      title="Account"
      description="Manage your profile details"
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
        <div class="space-y-5">
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
            @open="openOverlay"
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
              label: 'Save changes',
              color: 'primary',
              visible: canSave && !showDeleteConfirm,
              loading: isSaving,
              disabled: isDeleting,
              onClick: saveAccount,
            },
            {
              label: 'Delete account',
              color: 'danger',
              visible: !showDeleteConfirm,
              disabled: isSaving || isDeleting,
              onClick: handleDelete,
            },
            {
              label: 'Cancel',
              color: 'secondary',
              visible: !showDeleteConfirm,
              disabled: isSaving || isDeleting,
              onClick: () => (open = false),
            },
          ]"
        />
      </template>

      <!-- Email Verification Overlay -->
      <ProfileSettingsAccountEmailOverlay
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
      />
    </CommonOverlay>
  </div>
</template>
