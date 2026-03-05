<script setup lang="ts">
type SingleViewItemVariant = "card" | "plain";

interface Props {
  label?: string;
  hint?: string;
  variant?: SingleViewItemVariant;
}

const {
  label = undefined,
  hint = undefined,
  variant = "card",
} = defineProps<Props>();
</script>

<template>
  <div class="space-y-2">
    <div
      v-if="label || hint || !!$slots.hint"
      class="flex content-center items-center justify-between gap-1 text-sm"
    >
      <p v-if="label" class="pl-2 text-muted">{{ label }}</p>

      <div v-if="hint || !!$slots.hint" class="pr-2">
        <slot name="hint">
          <p v-if="hint" class="text-muted">{{ hint }}</p>
        </slot>
      </div>
    </div>

    <UCard v-if="variant === 'card'" variant="subtle">
      <slot />
    </UCard>

    <slot v-else />
  </div>
</template>
