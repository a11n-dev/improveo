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
  modalProps?: Record<string, unknown>;
  drawerProps?: Record<string, unknown>;
  /** Declarative footer actions - renders CommonOverlayFooter automatically when provided */
  actions?: FooterAction[];
}

const {
  title = undefined,
  description = undefined,
  icon = undefined,
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

const SCROLL_GATE_DRAG_THRESHOLD = 4;

const isElementVerticallyScrollable = (element: HTMLElement) => {
  const { overflowY } = window.getComputedStyle(element);

  return (
    ["auto", "scroll", "overlay"].includes(overflowY) &&
    element.scrollHeight > element.clientHeight
  );
};

const getClosestScrollableWithinContainer = (
  target: EventTarget | null,
  container: HTMLElement,
) => {
  if (!(target instanceof Node)) {
    return container;
  }

  let currentElement: HTMLElement | null =
    target instanceof HTMLElement ? target : target.parentElement;

  while (currentElement && currentElement !== container) {
    if (isElementVerticallyScrollable(currentElement)) {
      return currentElement;
    }

    currentElement = currentElement.parentElement;
  }

  return container;
};

const applyScrollGate = (container: HTMLElement) => {
  let startY = 0;
  let activeScrollable: HTMLElement = container;

  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 0) {
      return;
    }

    startY = event.touches[0]?.clientY ?? 0;
    activeScrollable = getClosestScrollableWithinContainer(
      event.target,
      container,
    );
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (event.touches.length === 0) {
      return;
    }

    const currentY = event.touches[0]?.clientY ?? 0;
    const deltaY = currentY - startY;

    if (deltaY <= SCROLL_GATE_DRAG_THRESHOLD) {
      return;
    }

    if (activeScrollable.scrollTop > 0) {
      return;
    }

    if (event.cancelable) {
      event.preventDefault();
    }
  };

  container.addEventListener("touchstart", handleTouchStart, { passive: true });
  container.addEventListener("touchmove", handleTouchMove, { passive: false });

  return () => {
    container.removeEventListener("touchstart", handleTouchStart);
    container.removeEventListener("touchmove", handleTouchMove);
  };
};

let cleanupScrollGate: (() => void) | null = null;

const setupScrollGate = async () => {
  if (!scrollGateEnabled.value) {
    cleanupScrollGate?.();
    cleanupScrollGate = null;
    return;
  }

  await nextTick();
  const container = drawerBodyRef.value?.closest('[data-slot="container"]');
  if (!(container instanceof HTMLElement)) {
    return;
  }

  cleanupScrollGate?.();
  cleanupScrollGate = applyScrollGate(container);
};

watch(
  [scrollGateEnabled, drawerBodyRef],
  () => {
    void setupScrollGate();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  cleanupScrollGate?.();
});
</script>

<template>
  <ClientOnly>
    <UModal
      v-if="isDesktop"
      v-model:open="open"
      :title="title"
      :description="description"
      v-bind="modalProps"
      @after:leave="emit('after:leave')"
    >
      <template #header>
        <slot v-if="$slots.header" name="header" />
        <CommonOverlayHeader
          v-else
          :title="title"
          :description="description"
          :icon="icon"
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
        footer: 'sticky bottom-0',
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
