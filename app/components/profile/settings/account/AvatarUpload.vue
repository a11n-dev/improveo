<script setup lang="ts">
const {
  avatarUrl = undefined,
  avatarAlt,
  hasStoredAvatar,
  removeCurrentAvatar,
  disabled = false,
} = defineProps<{
  avatarUrl?: string;
  avatarAlt: string;
  hasStoredAvatar: boolean;
  removeCurrentAvatar: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "remove-avatar"): void;
}>();
const avatarFile = defineModel<File | null>({ required: true });

/**
 * Primary helper text below avatar area.
 */
const fileDescription = computed(() =>
  avatarFile.value
    ? avatarFile.value.name
    : removeCurrentAvatar
      ? "Avatar will be removed after save."
      : "JPG, PNG or WEBP up to 3 MB.",
);

const hasSelectedFile = computed(() => Boolean(avatarFile.value));

const showRemoveAction = computed(
  () => hasSelectedFile.value || (hasStoredAvatar && !removeCurrentAvatar),
);

/**
 * Removes selected local file or marks stored avatar for removal.
 */
const handleRemoveClick = (event: MouseEvent): void => {
  event.preventDefault();
  event.stopPropagation();

  if (hasSelectedFile.value) {
    avatarFile.value = null;
    return;
  }

  emit("remove-avatar");
};
</script>

<template>
  <div class="space-y-2">
    <UFileUpload
      v-slot="{ open }"
      v-model="avatarFile"
      accept="image/jpeg,image/png,image/webp"
      :preview="false"
      class="w-full min-h-30"
      variant="area"
      :disabled="disabled"
      :ui="{
        icon: 'hidden',
        base: 'items-center justify-center text-center border-0 ring-0 shadow-none py-4',
      }"
    >
      <div
        class="flex flex-col items-center gap-2 cursor-pointer"
        @click="!disabled && open()"
      >
        <UAvatar :src="avatarUrl" :alt="avatarAlt" size="xl" class="size-16" />

        <span class="text-sm text-muted">{{ fileDescription }}</span>

        <div class="flex items-center gap-2">
          <UButton label="Edit" color="primary" variant="link" class="p-0" />

          <UButton
            v-if="showRemoveAction"
            label="Remove avatar"
            color="error"
            variant="link"
            class="p-0"
            :disabled="disabled"
            @click="handleRemoveClick"
          />
        </div>
      </div>
    </UFileUpload>
  </div>
</template>
