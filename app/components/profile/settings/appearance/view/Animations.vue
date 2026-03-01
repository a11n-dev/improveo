<script setup lang="ts">
const settingsStore = useSettingsStore();
const { notifyMessage } = useNotify();
const { settings } = storeToRefs(settingsStore);

const isUpdating = ref(false);
const reduceAnimationsEnabled = ref<boolean>(
  settings.value?.reduceAnimations ?? false,
);

/** Keeps local switch value aligned with optimistic store updates/reverts. */
watch(
  () => settings.value?.reduceAnimations,
  (value) => {
    reduceAnimationsEnabled.value = value ?? false;
  },
  { immediate: true },
);

/** Applies animation preference changes immediately after switch toggle. */
const handleReduceAnimationsChange = async (value: boolean): Promise<void> => {
  if (settings.value === null || isUpdating.value) {
    return;
  }

  if (value === settings.value?.reduceAnimations) {
    return;
  }

  isUpdating.value = true;

  try {
    const isUpdated = await settingsStore.updateReduceAnimations(value);

    if (isUpdated) {
      return;
    }

    reduceAnimationsEnabled.value = settings.value?.reduceAnimations ?? false;
    notifyMessage({ scope: "settings", code: "update_failed" });
  } finally {
    isUpdating.value = false;
  }
};
</script>

<template>
  <CommonSingleViewItem label="Animations">
    <ProfileSettingsField title="Reduce animation effects">
      <template #trailing>
        <USwitch
          v-model="reduceAnimationsEnabled"
          @update:model-value="handleReduceAnimationsChange"
        />
      </template>
    </ProfileSettingsField>
  </CommonSingleViewItem>
</template>
