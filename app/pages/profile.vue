<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { profile, pending, updateWeekStart } = useProfile();

/**
 * Handle week start change from settings component.
 */
const handleWeekStartChange = async (value: number): Promise<void> => {
  await updateWeekStart(value);
};
</script>

<template>
  <UContainer class="py-8 space-y-8">
    <!-- User Section -->
    <section>
      <div v-if="pending" class="flex items-center gap-4">
        <USkeleton class="size-12 rounded-full" />
        <div class="space-y-2">
          <USkeleton class="h-4 w-32" />
          <USkeleton class="h-3 w-48" />
        </div>
      </div>
      <ProfileUser v-else-if="profile" :profile="profile" />
      <div v-else class="text-sm text-muted">Failed to load profile</div>
    </section>

    <!-- Settings Section -->
    <section v-if="profile">
      <h2 class="font-medium mb-3 text-highlighted">Settings</h2>
      <UCard variant="subtle">
        <ProfileSettings
          :profile="profile"
          @update:week-start="handleWeekStartChange"
        />
      </UCard>
    </section>

    <!-- Actions Section -->
    <section v-if="profile">
      <ProfileActions />
    </section>
  </UContainer>
</template>
