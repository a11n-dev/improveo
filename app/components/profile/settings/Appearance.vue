<script setup lang="ts">
const colorMode = useColorMode();
const { updateColorMode } = useSettings();
const open = ref(false);

const colorModeOptions = [
  { label: "Light", value: "light", description: "Use light mode" },
  { label: "Dark", value: "dark", description: "Use dark mode" },
  { label: "System", value: "system", description: "Follow system settings" },
];

/** The saved preference at the time the overlay was opened. */
const savedPreference = ref<ColorModePreference>(resolvePreference());

/** Draft value the user is previewing inside the overlay. */
const draftPreference = ref<ColorModePreference>(resolvePreference());

const hasChanges = computed(
  () => draftPreference.value !== savedPreference.value,
);

const currentLabel = computed(
  () =>
    colorModeOptions.find((opt) => opt.value === savedPreference.value)
      ?.label ?? "System",
);

/**
 * Reads Nuxt color mode preference narrowed to the valid enum values.
 */
function resolvePreference(): ColorModePreference {
  const preference = colorMode.preference;
  if (
    preference === "light" ||
    preference === "dark" ||
    preference === "system"
  ) {
    return preference;
  }
  return "system";
}

/**
 * Opens the overlay and snapshots the current preference as the baseline.
 */
const openEditor = (): void => {
  savedPreference.value = resolvePreference();
  draftPreference.value = savedPreference.value;
  open.value = true;
};

/**
 * Live-preview: apply draft to Nuxt color mode as the user toggles options.
 */
watch(draftPreference, (value) => {
  colorMode.preference = value;
});

/**
 * Persists the draft to the server and closes the overlay.
 */
const save = (): void => {
  updateColorMode(draftPreference.value);
  open.value = false;
};

/**
 * Reverts the preview back to the saved preference and closes.
 */
const cancel = (): void => {
  colorMode.preference = savedPreference.value;
  draftPreference.value = savedPreference.value;
  open.value = false;
};
</script>

<template>
  <div class="space-y-3">
    <ProfileSettingsField
      title="Appearance"
      description="Choose your preferred color theme"
      icon="i-lucide-palette"
      :value="currentLabel"
      clickable
      show-chevron
      @click="openEditor"
    />

    <CommonOverlay
      v-model:open="open"
      title="Appearance"
      description="Choose your preferred color theme"
      :actions="[
        {
          label: 'Save',
          color: 'primary',
          visible: hasChanges,
          onClick: save,
        },
        {
          label: hasChanges ? 'Cancel' : 'Close',
          color: 'secondary',
          onClick: cancel,
        },
      ]"
    >
      <template #body>
        <URadioGroup
          v-model="draftPreference"
          :items="colorModeOptions"
          value-key="value"
          color="neutral"
          variant="table"
        />
      </template>
    </CommonOverlay>
  </div>
</template>
