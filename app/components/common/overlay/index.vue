<script setup lang="ts">
/**
 * Responsive overlay component that renders as UModal on desktop or UDrawer on mobile.
 * Provides consistent overlay behavior across different viewport sizes.
 * Supports declarative footer actions via :actions prop or custom footer via #footer slot.
 */
import type { FooterAction } from "./Footer.vue";

interface Props {
  title?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
  modalProps?: Record<string, unknown>;
  drawerProps?: Record<string, unknown>;
  actions?: FooterAction[];
}

const {
  title = undefined,
  description = undefined,
  icon = undefined,
  iconColor = undefined,
  modalProps = {},
  drawerProps = {},
  actions = undefined,
} = defineProps<Props>();

const emit = defineEmits<{
  (e: "after:leave"): void;
}>();

const open = defineModel<boolean>("open", { default: false });
const isDesktop = useIsDesktop();
const drawerBodyRef = ref<HTMLElement | null>(null);
const scrollGateEnabled = computed(() => !isDesktop.value && open.value);

useScrollGate(scrollGateEnabled, drawerBodyRef);
</script>

<template>
  <ClientOnly>
    <UModal
      v-if="isDesktop"
      v-model:open="open"
      :title="title"
      :description="description"
      v-bind="modalProps"
      :ui="{
        footer: [
          'relative bottom-0 z-20 overlay-footer-blur-mask [&:has([data-overlay-confirm])]:before:-top-full',
        ],
      }"
      @after:leave="emit('after:leave')"
    >
      <template #header>
        <slot v-if="$slots.header" name="header" />
        <CommonOverlayHeader
          v-else
          :title="title"
          :description="description"
          :icon="icon"
          :icon-color="iconColor"
          @close="open = false"
        />
      </template>
      <template #body>
        <slot name="body" />
      </template>
      <template #footer>
        <!-- Auto-render footer when :actions prop provided and no custom slot -->
        <CommonOverlayFooter
          v-if="actions && !$slots.footer"
          :actions="actions"
        />
        <!-- Custom footer slot takes precedence -->
        <slot v-else name="footer" />
      </template>
      <!-- Default slot for nested overlays -->
      <slot />
    </UModal>

    <UDrawer
      v-else
      v-model:open="open"
      :title="title"
      :description="description"
      v-bind="drawerProps"
      :ui="{
        container: [
          (actions && (actions?.length ?? 0) > 0) || $slots.footer
            ? 'pb-0'
            : 'pb-8',
          '[&:has([data-overlay-confirm])]:overflow-hidden',
        ],
        footer: ['sticky bottom-0 z-20 -mx-4 px-4 overlay-footer-blur-mask'],
      }"
      :scroll-lock-timeout="250"
      @after:leave="emit('after:leave')"
    >
      <template #header>
        <slot v-if="$slots.header" name="header" />
        <CommonOverlayHeader
          v-else
          :title="title"
          :description="description"
          :icon="icon"
          :icon-color="iconColor"
          @close="open = false"
        />
      </template>
      <template #body>
        <div ref="drawerBodyRef">
          <slot name="body" />
        </div>
      </template>

      <template v-if="(actions?.length ?? 0) > 0 || $slots.footer" #footer>
        <!-- Auto-render footer when :actions prop provided and no custom slot -->
        <CommonOverlayFooter
          v-if="actions && (actions?.length ?? 0) > 0 && !$slots.footer"
          :actions="actions"
        />
        <!-- Custom footer slot takes precedence -->
        <slot v-else name="footer" />
      </template>

      <!-- Default slot for nested overlays -->
      <slot />
    </UDrawer>

    <template #fallback />
  </ClientOnly>
</template>
