import type { Component } from "vue";

/**
 * Generic payload used to open a full-screen single-view panel.
 *
 * `TProps` allows each view to provide component-specific props while
 * preserving a shared navigation contract (`key`, `title`, `component`).
 */
export type SingleViewPayload<
  TProps extends Record<string, unknown> = Record<string, never>,
> = {
  key: string;
  title: string;
  component: Component;
  props?: TProps;
};
