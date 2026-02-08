<script setup lang="ts">
defineProps<{
  showDeleteConfirm: boolean;
  canSave: boolean;
  isSaving: boolean;
  isDeleting: boolean;
}>();
const emit = defineEmits<{
  (e: "save" | "delete" | "confirm-delete" | "cancel-delete"): void;
}>();
</script>

<template>
  <template v-if="showDeleteConfirm">
    <p class="text-center text-sm text-muted">
      Are you sure you want to delete your account?
    </p>
    <p class="mb-2 text-center text-sm text-muted">
      This action cannot be undone.
    </p>

    <UButton
      label="Delete account"
      color="error"
      block
      class="justify-center"
      :loading="isDeleting"
      :disabled="isDeleting"
      @click="emit('confirm-delete')"
    />

    <UButton
      label="Cancel"
      color="neutral"
      variant="subtle"
      block
      class="justify-center"
      :disabled="isDeleting"
      @click="emit('cancel-delete')"
    />
  </template>

  <template v-else>
    <UButton
      label="Delete account"
      color="error"
      variant="subtle"
      block
      class="justify-center"
      :disabled="isSaving || isDeleting"
      @click="emit('delete')"
    />

    <UButton
      label="Save changes"
      color="neutral"
      block
      :loading="isSaving"
      :disabled="!canSave || isDeleting"
      @click="emit('save')"
    />
  </template>
</template>
