<script setup lang="ts">
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

/** Persists a new animations preference when it differs from current state. */
const handleReduceAnimationsChange = async (value: boolean): Promise<void> => {
  if (settings.value === null || value === settings.value.reduceAnimations) {
    return;
  }

  await settingsStore.updateReduceAnimations(value);
};

/** Two-way model bound directly to persisted settings state. */
const reduceAnimationsEnabled = computed<boolean>({
  get: () => settings.value?.reduceAnimations ?? false,
  set: (value) => {
    void handleReduceAnimationsChange(value);
  },
});
</script>

<template>
  <CommonSingleViewItem label="Animations">
    <ProfileSettingsField title="Reduce animation effects">
      <template #trailing>
        <USwitch v-model="reduceAnimationsEnabled" />
      </template>
    </ProfileSettingsField>
  </CommonSingleViewItem>
</template>
