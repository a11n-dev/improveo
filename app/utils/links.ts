import type { NavigationMenuItem } from "@nuxt/ui";

export const navigationLinks: NavigationMenuItem[] = [
  { label: "Habits", icon: "i-lucide-calendar-check-2", to: "/" },
  { label: "Analytics", icon: "i-lucide-bar-chart-3", to: "/analytics" },
  { label: "Profile", icon: "i-lucide-user", to: "/profile" },
];
