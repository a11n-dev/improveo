<script setup lang="ts">
const usernameHint = ref<string | undefined>(undefined);
</script>

<template>
  <ProfileSettingsAccountViewAvatar />

  <CommonSingleViewItem label="Username">
    <template #hint>
      <span v-if="usernameHint" class="text-error">{{ usernameHint }}</span>
    </template>

    <ProfileSettingsList>
      <ProfileSettingsAccountViewUsername v-model:hint="usernameHint" />
    </ProfileSettingsList>
  </CommonSingleViewItem>

  <CommonSingleViewItem label="Email">
    <ProfileSettingsList>
      <ProfileSettingsAccountViewEmail />
    </ProfileSettingsList>
  </CommonSingleViewItem>

  <ProfileSettingsAccountViewDanger />
</template>
