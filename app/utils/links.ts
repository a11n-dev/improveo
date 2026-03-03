import type { NavigationMenuItem } from "@nuxt/ui";

/** Primary app navigation links displayed in the bottom menu. */
export const navigationLinks: NavigationMenuItem[] = [
  { label: "Habits", icon: "i-lucide-calendar-check-2", to: "/" },
  { label: "Profile", icon: "i-lucide-user", to: "/profile" },
];
