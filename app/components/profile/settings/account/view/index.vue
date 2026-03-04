<template>
  <ProfileSettingsAccountViewAvatar />

  <CommonSingleViewItem label="Username">
    <ProfileSettingsList>
      <ProfileSettingsAccountViewUsername />
    </ProfileSettingsList>
  </CommonSingleViewItem>

  <CommonSingleViewItem label="Email">
    <ProfileSettingsList>
      <ProfileSettingsAccountViewEmail />
    </ProfileSettingsList>
  </CommonSingleViewItem>

  <ProfileSettingsAccountViewDanger />
</template>
