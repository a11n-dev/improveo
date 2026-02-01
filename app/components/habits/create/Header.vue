<script setup lang="ts">
const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div class="flex w-full items-center justify-between gap-3">
    <div class="flex flex-col">
      <span class="text-lg font-semibold text-highlighted">Create Habit</span>
      <span class="text-sm text-muted">Add a new habit to track.</span>
    </div>

    <UButton
      icon="i-lucide-x"
      color="neutral"
      variant="ghost"
      aria-label="Close"
      @click="emit('close')"
    />
  </div>
</template>
