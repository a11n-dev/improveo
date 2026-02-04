<script setup lang="ts">
/**
 * Responsive overlay component that renders as UModal on desktop or UDrawer on mobile.
 * Provides consistent overlay behavior across different viewport sizes.
 */
interface Props {
  title?: string;
  description?: string;
  modalProps?: Record<string, unknown>;
  drawerProps?: Record<string, unknown>;
}

const {
  title = undefined,
  description = undefined,
  modalProps = {},
  drawerProps = {},
} = defineProps<Props>();

const open = defineModel<boolean>("open", { default: false });
const isDesktop = useIsDesktop();
const drawerBodyRef = ref<HTMLElement | null>(null);
const scrollGateEnabled = computed(() => !isDesktop.value && open.value);

const applyScrollGate = (container: HTMLElement) => {
  let startY = 0;

  const handleTouchStart = (event: TouchEvent) => {
    if (event.touches.length === 0) {
      return;
    }

    startY = event.touches[0]?.clientY ?? 0;
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (event.touches.length === 0) {
      return;
    }

    const currentY = event.touches[0]?.clientY ?? 0;
    const deltaY = currentY - startY;
    if (container.scrollTop <= 0 && deltaY > 0 && event.cancelable) {
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
    >
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>
      <template #body>
        <slot name="body" />
      </template>
      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
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
    >
      <template v-if="$slots.header" #header>
        <slot name="header" />
      </template>
      <template #body>
        <div ref="drawerBodyRef">
          <slot name="body" />
        </div>
      </template>
      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
      <!-- Default slot for nested overlays -->
      <slot />
    </UDrawer>
  </ClientOnly>
</template>
