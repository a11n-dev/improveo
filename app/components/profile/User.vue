<script setup lang="ts">
/**
 * Props for the ProfileUser component.
 */
interface Props {
  /** The user profile data containing name, email, and id. */
  profile: Profile;
}

const props = defineProps<Props>();

/**
 * Computed display name - falls back to "User" if name is null/empty.
 */
const displayName = computed(() => props.profile.name ?? "User");

/**
 * Computed member since text formatted as "Since Mmm YYYY".
 */
const memberSince = computed(() => formatMemberSince(props.profile.createdAt));
</script>

<template>
  <div class="flex items-center gap-4">
    <UUser
      :name="displayName"
      :description="memberSince"
      :avatar="{ alt: displayName }"
      size="xl"
    />
  </div>
</template>
