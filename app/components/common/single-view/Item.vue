<script setup lang="ts">
type SingleViewItemVariant = "card" | "plain";

interface Props {
  label?: string;
  variant?: SingleViewItemVariant;
}

const { label = undefined, variant = "card" } = defineProps<Props>();
</script>

<template>
  <div class="space-y-2">
    <p v-if="label" class="pl-2 text-sm text-muted">{{ label }}</p>

    <UCard v-if="variant === 'card'" variant="subtle">
      <slot />
    </UCard>

    <slot v-else />
  </div>
</template>
