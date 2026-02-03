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
  title,
  description,
  modalProps = {},
  drawerProps = {},
} = defineProps<Props>();

const open = defineModel<boolean>("open", { default: false });
const isDesktop = useIsDesktop();
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
        <slot name="body" />
      </template>
      <template v-if="$slots.footer" #footer>
        <slot name="footer" />
      </template>
      <!-- Default slot for nested overlays -->
      <slot />
    </UDrawer>
  </ClientOnly>
</template>
