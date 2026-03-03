<script setup lang="ts">
interface AppearanceOption {
  label: string;
  value: ColorModePreference;
}

/** Available appearance themes aligned with Nuxt color-mode preferences. */
const THEME_OPTIONS: AppearanceOption[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);

/** Persists a new color mode value when it differs from current state. */
const handleColorModeChange = async (
  value: ColorModePreference,
): Promise<void> => {
  if (settings.value === null || value === settings.value.colorMode) {
    return;
  }

  await settingsStore.updateColorMode(value);
};

/** Two-way model bound directly to persisted settings state. */
const selectedColorMode = computed<ColorModePreference>({
  get: () => settings.value?.colorMode ?? "system",
  set: (value) => {
    void handleColorModeChange(value);
  },
});
</script>

<template>
  <CommonSingleViewItem label="Theme" variant="plain">
    <URadioGroup
      v-model="selectedColorMode"
      :items="THEME_OPTIONS"
      value-key="value"
      variant="card"
      color="neutral"
    />
  </CommonSingleViewItem>
</template>
