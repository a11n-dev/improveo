export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastOverrides = {
  icon?: string;
  duration?: number;
};

export type NotifyToast = (
  title: string,
  description?: string,
  overrides?: ToastOverrides,
) => void;
