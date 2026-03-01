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
const { notifyMessage } = useNotify();
const { settings } = storeToRefs(settingsStore);
const colorMode = useColorMode();

const isUpdating = ref(false);
const selectedColorMode = ref<ColorModePreference>(
  settings.value?.colorMode ?? "system",
);

/** Keeps local selection aligned with optimistic store updates/reverts. */
watch(
  () => settings.value?.colorMode,
  (value) => {
    selectedColorMode.value = value ?? "system";
  },
  { immediate: true },
);

/** Applies color mode changes immediately after option selection. */
const handleColorModeChange = async (
  value: ColorModePreference,
): Promise<void> => {
  if (settings.value === null || isUpdating.value) {
    return;
  }

  if (value === settings.value?.colorMode) {
    return;
  }

  const previousPreference = settings.value?.colorMode ?? "system";

  selectedColorMode.value = value;
  colorMode.preference = value;
  isUpdating.value = true;

  try {
    const isUpdated = await settingsStore.updateColorMode(value);

    if (isUpdated) {
      return;
    }

    selectedColorMode.value = previousPreference;
    colorMode.preference = previousPreference;
    notifyMessage({ scope: "settings", code: "update_failed" });
  } finally {
    isUpdating.value = false;
  }
};
</script>

<template>
  <CommonSingleViewItem label="Theme" variant="plain">
    <URadioGroup
      v-model="selectedColorMode"
      :items="THEME_OPTIONS"
      value-key="value"
      variant="card"
      color="neutral"
      @update:model-value="handleColorModeChange"
    />
  </CommonSingleViewItem>
</template>
