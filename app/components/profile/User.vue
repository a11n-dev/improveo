<script setup lang="ts">
interface Props {
  profile: Profile;
}

const { profile } = defineProps<Props>();
const supabaseClient = useSupabaseClient();

/** Username fallback used when account username is not set. */
const displayName = computed(() => profile.username ?? "User");
const displayHandle = computed(() =>
  profile.username ? `@${profile.username}` : displayName.value,
);
/** Human-friendly account creation date. */
const joinedLabel = computed(() => formatMemberSince(profile.createdAt));
/** Public URL for the user avatar image. */
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
        {{ displayHandle }}
      </p>
      <p class="text-sm text-muted">{{ joinedLabel }}</p>
    </div>
  </div>
</template>
