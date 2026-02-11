<script setup lang="ts">
const colorMode = useColorMode();
const { settings, updateColorMode } = useSettings();
const open = ref(false);

const colorModeOptions = [
  {
    label: "Light",
    value: "light",
    description: "Theme will be in light mode",
  },
  { label: "Dark", value: "dark", description: "Theme will be in dark mode" },
  {
    label: "System",
    value: "system",
    description: "Theme will follow the system settings",
  },
];

const toColorModePreference = (
  value: string | undefined,
): ColorModePreference => {
  if (value === "light" || value === "dark" || value === "system") {
    return value;
  }

  return "system";
};

const persistedPreference = computed(() =>
  toColorModePreference(settings.value?.colorMode ?? colorMode.preference),
);

/** The saved preference at the time the overlay was opened. */
const savedPreference = ref<ColorModePreference>(persistedPreference.value);

/** Draft value the user is previewing inside the overlay. */
const draftPreference = ref<ColorModePreference>(persistedPreference.value);

const hasChanges = computed(
  () => draftPreference.value !== savedPreference.value,
);

const currentLabel = computed(
  () =>
    colorModeOptions.find((opt) => opt.value === persistedPreference.value)
      ?.label ?? "System",
);

/**
 * Opens the overlay and snapshots the current preference as the baseline.
 */
const openEditor = (): void => {
  savedPreference.value = persistedPreference.value;
  draftPreference.value = savedPreference.value;
  open.value = true;
};

/**
 * Live-preview: apply draft to Nuxt color mode as the user toggles options.
 */
watch(draftPreference, (value) => {
  if (!open.value) {
    return;
  }

  colorMode.preference = value;
});

watch(open, (isOpen) => {
  if (isOpen) {
    return;
  }

  colorMode.preference = savedPreference.value;
  draftPreference.value = savedPreference.value;
});

/**
 * Persists the draft to the server and closes the overlay.
 */
const save = async (): Promise<void> => {
  const nextPreference = draftPreference.value;
  const previousPreference = savedPreference.value;
  const isUpdated = await updateColorMode(nextPreference);

  if (!isUpdated) {
    colorMode.preference = previousPreference;
    draftPreference.value = previousPreference;
    return;
  }

  savedPreference.value = nextPreference;
  draftPreference.value = nextPreference;
  open.value = false;
};

const handleSave = async (): Promise<void> => {
  if (!hasChanges.value) {
    open.value = false;
    return;
  }

  await save();
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
          onClick: handleSave,
        },
      ]"
    >
      <template #body>
        <UFormField label="Theme" name="theme">
          <URadioGroup
            v-model="draftPreference"
            :items="colorModeOptions"
            value-key="value"
            color="neutral"
            variant="card"
          />
        </UFormField>
      </template>
    </CommonOverlay>
  </div>
</template>
