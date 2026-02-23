import type {
  NotificationCodeKey,
  NotificationParamsByKey,
  NotificationScopeKey,
} from "~/types/notifications";

import { notifications as authNotifications } from "~/services/notifications/auth";
import { notifications as habitsNotifications } from "~/services/notifications/habits";
import { notifications as profileNotifications } from "~/services/notifications/profile";
import { notifications as settingsNotifications } from "~/services/notifications/settings";
import { notifications as supabaseNotifications } from "~/services/notifications/supabase";

export const notificationScopes = {
  auth: authNotifications,
  habits: habitsNotifications,
  profile: profileNotifications,
  settings: settingsNotifications,
  supabase: supabaseNotifications,
} as const;

export type AppNotificationScopes = typeof notificationScopes;
export type NotificationScope = NotificationScopeKey<AppNotificationScopes>;

export type NotificationCode<TScope extends NotificationScope> =
  NotificationCodeKey<AppNotificationScopes, TScope>;

export type NotificationParams<
  TScope extends NotificationScope,
  TCode extends NotificationCode<TScope>,
> = NotificationParamsByKey<AppNotificationScopes, TScope, TCode>;
