<script setup lang="ts">
const { profile } = defineProps<{ profile: Profile }>();
const supabaseClient = useSupabaseClient();

const displayName = computed(() => profile.name ?? "User");
const joinedLabel = computed(() => formatMemberSince(profile.createdAt));
const avatarUrl = computed(() =>
  getAvatarPublicUrl(supabaseClient, profile.avatarPath),
);
</script>

<template>
  <div
    class="flex flex-col items-center gap-2 text-center md:flex-row md:items-center md:gap-3 md:text-left"
  >
    <UAvatar
      :src="avatarUrl"
      :alt="displayName"
      size="xl"
      class="size-20 md:size-12"
    />

    <div>
      <p class="font-semibold text-highlighted">
        {{ displayName }}
      </p>
      <p class="text-sm text-muted">{{ joinedLabel }}</p>
    </div>
  </div>
</template>
