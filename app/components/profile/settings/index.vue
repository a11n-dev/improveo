<script setup lang="ts">
const { profile } = defineProps<{ profile: Profile }>();
const emit = defineEmits<{
  (e: "update:weekStart", value: number): void;
}>();
</script>

<template>
  <div class="divide-y divide-default">
    <!-- Account -->
    <div class="pb-4">
      <ProfileSettingsAccount :profile="profile" />
    </div>

    <!-- Appearance -->
    <div class="py-4">
      <ProfileSettingsAppearance />
    </div>

    <!-- Calendar Preferences -->
    <div class="pt-4">
      <ProfileSettingsWeekStart
        :model-value="profile.weekStart"
        @update:model-value="emit('update:weekStart', $event)"
      />
    </div>
  </div>
</template>
