<script setup lang="ts">
const { profile } = defineProps<{ profile: Profile }>();

const { settings, updateWeekStart } = useSettings();

const handleWeekStartChange = async (value: number): Promise<void> => {
  await updateWeekStart(value);
};
</script>

<template>
  <div class="divide-y divide-default">
    <!-- Account -->
    <div class="pb-3">
      <ProfileSettingsAccount :profile="profile" />
    </div>

    <!-- Appearance -->
    <div class="py-3">
      <ProfileSettingsAppearance />
    </div>

    <!-- Calendar Preferences -->
    <div class="pt-3">
      <ProfileSettingsWeekStart
        :model-value="settings?.weekStart ?? 0"
        @update:model-value="handleWeekStartChange"
      />
    </div>
  </div>
</template>
