<script setup lang="ts">
import { markRaw } from "vue";
import type { SingleViewPayload } from "~/types/singleview";

import AccountView from "./account/view/index.vue";
import AppearanceView from "./appearance/view/index.vue";
import WeekStartView from "./week-start/View.vue";

const emit = defineEmits<{
  "open-view": [view: SingleViewPayload];
}>();

type SettingsViewKey = "account" | "appearance" | "weekStart";

/** Registry of settings subviews that can be opened from the main list. */
const SETTINGS_VIEWS: Record<SettingsViewKey, SingleViewPayload> = {
  account: {
    key: "account",
    title: "Account",
    component: markRaw(AccountView),
  },
  appearance: {
    key: "appearance",
    title: "Appearance",
    component: markRaw(AppearanceView),
  },
  weekStart: {
    key: "week-start",
    title: "Start Week On",
    component: markRaw(WeekStartView),
  },
};

/** Opens a full-screen settings subview by key. */
const openView = (viewKey: SettingsViewKey): void => {
  emit("open-view", { ...SETTINGS_VIEWS[viewKey] });
};
</script>

<template>
  <ProfileSettingsList>
    <ProfileSettingsAccount @open="openView('account')" />
    <ProfileSettingsAppearance @open="openView('appearance')" />
    <ProfileSettingsWeekStart @open="openView('weekStart')" />
  </ProfileSettingsList>
</template>
