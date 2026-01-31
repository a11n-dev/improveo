<script setup lang="ts">
interface Props {
  monthYearLabel: string;
  isNextDisabled?: boolean;
}

const { monthYearLabel, isNextDisabled = false } = defineProps<Props>();

const emit = defineEmits<{
  prev: [];
  next: [];
  today: [];
}>();
</script>

<template>
  <div class="flex items-center justify-between">
    <UButton
      color="neutral"
      variant="subtle"
      size="md"
      icon="i-lucide-calendar"
      :label="monthYearLabel"
      @click="emit('today')"
    />

    <div class="flex items-center gap-1">
      <UButton
        icon="i-lucide-chevron-left"
        color="neutral"
        variant="subtle"
        size="md"
        aria-label="Previous month"
        @click="emit('prev')"
      />
      <UButton
        icon="i-lucide-chevron-right"
        color="neutral"
        variant="subtle"
        size="md"
        aria-label="Next month"
        :disabled="isNextDisabled"
        @click="emit('next')"
      />
    </div>
  </div>
</template>
