import type { ToastOverrides, ToastVariant } from "~/types/notifications";

export type AddToast = (
  variant: ToastVariant,
  title: string,
  description?: string,
  overrides?: ToastOverrides,
) => void;

export type NotifyToast = (
  title: string,
  description?: string,
  overrides?: ToastOverrides,
) => void;
