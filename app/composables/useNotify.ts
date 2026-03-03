import type {
  AppNotificationScopes,
  NotificationCode,
  NotificationScope,
} from "~/services/notifications";
import type {
  NotificationDefinition,
  NotifyMessageInput,
  ToastOverrides,
  ToastVariant,
} from "~/types/notifications";

import { notificationScopes } from "~/services/notifications";

const DEFAULT_ICONS: Record<ToastVariant, string> = {
  success: "i-lucide-check-circle",
  error: "i-lucide-alert-circle",
  warning: "i-lucide-alert-triangle",
  info: "i-lucide-info",
};

type AppNotifyMessageInput<
  TScope extends NotificationScope,
  TCode extends NotificationCode<TScope>,
> = NotifyMessageInput<AppNotificationScopes, TScope, TCode>;

/**
 * Runtime notification input for external/provider codes (for example, API error codes).
 */
type RuntimeNotifyMessageInput = {
  scope: NotificationScope;
  code: string;
  variant?: ToastVariant;
  overrides?: ToastOverrides;
  params?: unknown;
};

/**
 * Provides strongly typed notification dispatch by scope and code.
 */
export const useNotify = () => {
  const toast = useToast();

  /**
   * Dispatches a known app notification with full compile-time checks.
   */
  function notifyMessage<
    TScope extends NotificationScope,
    TCode extends NotificationCode<TScope>,
  >(input: AppNotifyMessageInput<TScope, TCode>): void;

  /**
   * Dispatches notifications from runtime string codes (for example `error.code`).
   */
  function notifyMessage(input: RuntimeNotifyMessageInput): void;

  function notifyMessage(input: RuntimeNotifyMessageInput): void {
    const scopeCatalog = notificationScopes[input.scope] as Record<
      string,
      NotificationDefinition<unknown>
    >;

    // Handle unknown codes gracefully with a shared fallback branch.
    if (!(input.code in scopeCatalog)) {
      console.error(
        `[notify] Unknown notification code "${input.code}" for scope "${input.scope}"`,
        { scope: input.scope, code: input.code },
      );

      toast.add({
        title: "Unknown error",
        description: "Something went wrong. Please try again.",
        color: "error",
        icon: DEFAULT_ICONS["error"],
      });

      return;
    }

    const definition = scopeCatalog[input.code]!;
    const message = definition.build(input.params);
    const variant = input.variant ?? definition.defaultVariant;

    toast.add({
      title: message.title,
      description: message.description,
      color: variant,
      icon: input.overrides?.icon ?? DEFAULT_ICONS[variant],
      duration: input.overrides?.duration,
    });
  }

  return {
    notifyMessage,
  };
};
