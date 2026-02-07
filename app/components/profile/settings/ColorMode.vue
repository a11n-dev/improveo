<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";
import SettingField from "./SettingField.vue";

type ColorModePreference = "light" | "dark" | "system";

const colorMode = useColorMode();

const colorModeOptions: TabsItem[] = [
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" },
  { label: "System", value: "system" },
];

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
  },
});
</script>

<template>
  <SettingField
    title="Appearance"
    description="Choose your preferred color theme"
  >
    <template #trailing>
      <UTabs
        v-model="selectedPreference"
        :items="colorModeOptions"
        :content="false"
        color="neutral"
        variant="pill"
        size="sm"
        class="w-48"
      />
    </template>
  </SettingField>
</template>
