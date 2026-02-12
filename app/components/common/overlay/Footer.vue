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
 * Active confirmation action, if visible.
 */
const activeConfirmAction = computed(() =>
  visibleActions.value.find(
    (action): action is ConfirmAction => action.type === "confirm",
  ),
);

/**
 * Visible non-confirm button actions.
 */
const buttonActions = computed(() =>
  visibleActions.value.filter(
    (action): action is ButtonAction => action.type !== "confirm",
  ),
);
</script>

<template>
  <div class="relative z-10 w-full">
    <button
      v-if="activeConfirmAction"
      type="button"
      aria-label="Cancel confirmation"
      class="absolute inset-x-0 bottom-full z-0 h-dvh bg-transparent -mx-4"
      @click="activeConfirmAction.onCancel"
    />
    <div class="relative z-10 flex w-full flex-col gap-2">
      <!-- Top slot for custom content above buttons -->
      <slot name="top" />

      <div class="relative">
        <div
          class="flex flex-col gap-2"
          :class="activeConfirmAction ? 'invisible pointer-events-none' : ''"
        >
          <UButton
            v-for="(action, index) in buttonActions"
            :key="`button-${index}`"
            :label="action.label"
            :color="buttonPresets[action.color || 'primary'].color"
            :variant="buttonPresets[action.color || 'primary'].variant"
            block
            :disabled="Boolean(activeConfirmAction) || action.disabled"
            :loading="activeConfirmAction ? false : action.loading"
            @click="action.onClick"
          />
        </div>

        <div v-if="activeConfirmAction" class="absolute inset-x-0 bottom-0">
          <div
            aria-hidden="true"
            class="pointer-events-none absolute -mx-4 inset-x-0 bottom-0 top-[calc(-100%-3rem)] backdrop-blur-sm mask-[linear-gradient(to_top,black_0%,black_70%,transparent_100%)]"
          />

          <div data-overlay-confirm class="relative flex flex-col gap-2">
            <div
              class="pointer-events-none absolute inset-x-0 bottom-full mb-2 text-center text-sm text-muted"
            >
              <p>{{ activeConfirmAction.confirmText }}</p>
              <p v-if="activeConfirmAction.confirmSubtext">
                {{ activeConfirmAction.confirmSubtext }}
              </p>
            </div>

            <UButton
              label="Confirm"
              :color="
                buttonPresets[activeConfirmAction.color || 'primary'].color
              "
              variant="solid"
              block
              :disabled="activeConfirmAction.disabled"
              :loading="activeConfirmAction.loading"
              @click="activeConfirmAction.onConfirm"
            />

            <UButton
              label="Cancel"
              :color="buttonPresets.secondary.color"
              :variant="buttonPresets.secondary.variant"
              block
              :disabled="activeConfirmAction.loading"
              @click="activeConfirmAction.onCancel"
            />
          </div>
        </div>
      </div>

      <!-- Bottom slot for custom content below buttons -->
      <slot name="bottom" />
    </div>
  </div>
</template>
