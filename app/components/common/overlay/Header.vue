<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
  icon?: string;
  iconColor?: string;
}

const {
  title = undefined,
  description = undefined,
  icon = undefined,
  iconColor = undefined,
} = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div class="flex w-full items-start justify-between gap-4">
    <div class="flex min-w-0 flex-1 items-start gap-3">
      <div
        v-if="icon"
        class="mt-0.5 flex size-11 shrink-0 items-center justify-center rounded-md bg-elevated"
        :style="{
          backgroundColor: iconColor ? dimColor(iconColor) : undefined,
        }"
      >
        <UIcon
          :name="icon"
          class="size-5.5 text-highlighted"
          :style="{ color: iconColor ?? undefined }"
        />
      </div>

      <div class="min-w-0">
        <p v-if="title" class="text-lg font-semibold text-highlighted">
          {{ title }}
        </p>
        <p v-if="description" class="text-sm text-muted">
          {{ description }}
        </p>
      </div>
    </div>

    <UButton
      icon="i-lucide-x"
      color="neutral"
      aria-label="Close"
      @click="emit('close')"
    />
  </div>
</template>
