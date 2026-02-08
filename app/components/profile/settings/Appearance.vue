<script setup lang="ts">
type ColorModePreference = "light" | "dark" | "system";

const colorMode = useColorMode();
const open = ref(false);

const colorModeOptions = [
  { label: "Light", value: "light", description: "Use light mode" },
  { label: "Dark", value: "dark", description: "Use dark mode" },
  { label: "System", value: "system", description: "Follow system settings" },
];

/**
 * Bridges Nuxt color mode preference into strict radio group values.
 */
const selectedPreference = computed<ColorModePreference>({
  get: () => {
    const preference = colorMode.preference;
    if (
      preference === "light" ||
      preference === "dark" ||
      preference === "system"
    ) {
      return preference;
    }
    return "system";
  },
  set: (value) => {
    colorMode.preference = value;
    // We don't close automatically here to let user confirm/see the change
  },
});

const currentLabel = computed(
  () =>
    colorModeOptions.find((opt) => opt.value === selectedPreference.value)
      ?.label ?? "System",
);
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
      @click="open = true"
    />

    <CommonOverlay
      v-model:open="open"
      title="Appearance"
      description="Choose your preferred color theme"
      :actions="[
        {
          label: 'Close',
          color: 'secondary',
          onClick: () => (open = false),
        },
      ]"
    >
      <template #body>
        <URadioGroup
          v-model="selectedPreference"
          :items="colorModeOptions"
          value-key="value"
          color="neutral"
          variant="table"
        />
      </template>
    </CommonOverlay>
  </div>
</template>
