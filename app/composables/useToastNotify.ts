import type { ToastOverrides, ToastVariant, NotifyToast } from "~/types/toast";

const DEFAULT_ICONS: Record<ToastVariant, string> = {
  success: "i-lucide-check-circle",
  error: "i-lucide-alert-circle",
  warning: "i-lucide-alert-triangle",
  info: "i-lucide-info",
};

export const useToastNotify = () => {
  const toast = useToast();

  const addToast = (
    variant: ToastVariant,
    title: string,
    description?: string,
    overrides?: ToastOverrides,
  ): void => {
    toast.add({
      title,
      description,
      color: variant,
      icon: overrides?.icon ?? DEFAULT_ICONS[variant],
      duration: overrides?.duration,
    });
  };

  const notifySuccess: NotifyToast = (title, description, overrides) => {
    addToast("success", title, description, overrides);
  };

  const notifyError: NotifyToast = (title, description, overrides) => {
    addToast("error", title, description, overrides);
  };

  const notifyWarning: NotifyToast = (title, description, overrides) => {
    addToast("warning", title, description, overrides);
  };

  const notifyInfo: NotifyToast = (title, description, overrides) => {
    addToast("info", title, description, overrides);
  };

  return {
    notifyError,
    notifyInfo,
    notifySuccess,
    notifyWarning,
  };
};
