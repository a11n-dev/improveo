<script setup lang="ts">
/**
 * Reusable footer component for overlay actions with consistent styling and behavior.
 * Supports conditional visibility, loading states, confirmation modes, and custom content via slots.
 */

// Base properties shared by all action types
interface BaseAction {
  visible?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

// Regular button action
export interface ButtonAction extends BaseAction {
  type?: "button";
  label: string;
  color?: "primary" | "secondary" | "danger" | "outline";
  onClick?: () => void;
}

// Confirmation mode action
export interface ConfirmAction extends BaseAction {
  type: "confirm";
  color?: "danger" | "primary";
  confirmText: string;
  confirmSubtext?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export type FooterAction = ButtonAction | ConfirmAction;

type ButtonPreset = {
  color: "neutral" | "error";
  variant?: "outline" | "solid";
};

interface Props {
  actions: FooterAction[];
}

const { actions } = defineProps<Props>();

/**
 * Button configuration presets for consistent styling.
 * Primary uses neutral color as per design system preference.
 */
const buttonPresets = {
  primary: { color: "neutral", variant: "solid" },
  secondary: { color: "neutral", variant: undefined },
  danger: { color: "error", variant: undefined },
  outline: { color: "neutral", variant: "outline" },
} as const satisfies Record<NonNullable<ButtonAction["color"]>, ButtonPreset>;

/**
 * Filter actions by visibility, defaulting to visible.
 */
const visibleActions = computed(() =>
  actions.filter((action) => action.visible !== false),
);

/**
 * Separate confirmation actions from button actions.
 * Confirmation actions are rendered first (on top).
 */
const confirmActions = computed(() =>
  visibleActions.value.filter(
    (action): action is ConfirmAction => action.type === "confirm",
  ),
);

const buttonActions = computed(() =>
  visibleActions.value.filter(
    (action): action is ButtonAction => action.type !== "confirm",
  ),
);
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <!-- Top slot for custom content above buttons -->
    <slot name="top" />

    <!-- Confirmation actions (always rendered first/on top) -->
    <template
      v-for="(action, index) in confirmActions"
      :key="`confirm-${index}`"
    >
      <!-- Confirmation text -->
      <div class="mb-2 text-center text-sm text-muted">
        <p>{{ action.confirmText }}</p>
        <p v-if="action.confirmSubtext">{{ action.confirmSubtext }}</p>
      </div>

      <!-- Confirm button (on top) -->
      <UButton
        label="Confirm"
        :color="buttonPresets[action.color || 'primary'].color"
        :variant="buttonPresets[action.color || 'primary'].variant"
        block
        :disabled="action.disabled"
        :loading="action.loading"
        @click="action.onConfirm"
      />

      <!-- Cancel button (below confirm) -->
      <UButton
        label="Cancel"
        :color="buttonPresets.secondary.color"
        :variant="buttonPresets.secondary.variant"
        block
        :disabled="action.loading"
        @click="action.onCancel"
      />
    </template>

    <!-- Regular button actions -->
    <UButton
      v-for="(action, index) in buttonActions"
      :key="`button-${index}`"
      :label="action.label"
      :color="buttonPresets[action.color || 'primary'].color"
      :variant="buttonPresets[action.color || 'primary'].variant"
      block
      :disabled="action.disabled"
      :loading="action.loading"
      @click="action.onClick"
    />

    <!-- Bottom slot for custom content below buttons -->
    <slot name="bottom" />
  </div>
</template>
