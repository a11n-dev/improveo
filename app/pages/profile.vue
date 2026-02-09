<script setup lang="ts">
definePageMeta({
  keepalive: true,
});

const { error, pending, profile } = useProfile();

const isLoading = computed(
  () => pending.value && !profile.value && !error.value,
);
</script>

<template>
  <UContainer class="py-8 space-y-8">
    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="fixed inset-0 flex items-center justify-center"
    >
      <LoadingState />
    </div>

    <!-- Error state -->
    <div
      v-else-if="error"
      class="fixed inset-0 flex items-center justify-center px-6"
    >
      <UEmpty
        title="Oops..."
        description="Something went wrong while loading your profile. Please try again later."
      />
    </div>

    <template v-else>
      <!-- User section -->
      <section>
        <ProfileUser v-if="profile" :profile="profile" />
      </section>

      <!-- Settings section -->
      <section v-if="profile">
        <h2 class="font-medium mb-3 text-highlighted">Settings</h2>
        <UCard variant="subtle">
          <ProfileSettings :profile="profile" />
        </UCard>
      </section>

      <!-- Actions section -->
      <section v-if="profile">
        <ProfileActions />
      </section>
    </template>
  </UContainer>
</template>
