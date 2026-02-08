<script setup lang="ts">
const { profile } = defineProps<{ profile: Profile }>();
const emit = defineEmits<{
  (e: "update:weekStart", value: number): void;
}>();
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
        :model-value="profile.weekStart"
        @update:model-value="emit('update:weekStart', $event)"
      />
    </div>
  </div>
</template>
