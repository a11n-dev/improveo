/** Supported toast color variants. */
export type ToastVariant = "success" | "error" | "warning" | "info";

/** Optional per-toast UI overrides. */
export type ToastOverrides = {
  icon?: string;
  duration?: number;
};

/** Resolved message payload rendered in toast UI. */
export type NotificationMessage = {
  title: string;
  description?: string;
};

/**
 * Notification entry definition.
 *
 * `TParams` allows each code to define required interpolation parameters.
 */
export type NotificationDefinition<TParams = undefined> = {
  defaultVariant: ToastVariant;
  build: (params: TParams) => NotificationMessage;
};

/** Collection of message definitions for one scope. */
export type NotificationCatalog = Record<string, NotificationDefinition<never>>;

/** App-level scope map (`auth`, `profile`, etc). */
export type NotificationScopes = Record<string, NotificationCatalog>;

/** Helper to preserve generic parameter inference for notification entries. */
export const defineNotification = <TParams = undefined>(
  definition: NotificationDefinition<TParams>,
): NotificationDefinition<TParams> => definition;

/** Valid scope keys inferred from registered scopes. */
export type NotificationScopeKey<TScopes extends NotificationScopes> =
  keyof TScopes & string;

/** Valid code keys inferred from a given scope. */
export type NotificationCodeKey<
  TScopes extends NotificationScopes,
  TScope extends NotificationScopeKey<TScopes>,
> = keyof TScopes[TScope] & string;

/** Params type inferred from a scope+code pair. */
export type NotificationParamsByKey<
  TScopes extends NotificationScopes,
  TScope extends NotificationScopeKey<TScopes>,
  TCode extends NotificationCodeKey<TScopes, TScope>,
> =
  TScopes[TScope][TCode] extends NotificationDefinition<infer TParams>
    ? TParams
    : never;

type NotificationParamsField<TParams> = [TParams] extends [undefined]
  ? { params?: undefined }
  : { params: TParams };

/**
 * Typed object input for `notifyMessage`.
 *
 * If a notification code requires params, `params` becomes mandatory.
 */
export type NotifyMessageInput<
  TScopes extends NotificationScopes,
  TScope extends NotificationScopeKey<TScopes>,
  TCode extends NotificationCodeKey<TScopes, TScope>,
> = {
  scope: TScope;
  code: TCode;
  variant?: ToastVariant;
  overrides?: ToastOverrides;
} & NotificationParamsField<NotificationParamsByKey<TScopes, TScope, TCode>>;
