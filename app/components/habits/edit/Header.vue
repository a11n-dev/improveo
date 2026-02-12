<script setup lang="ts">
const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div class="flex w-full items-center justify-between gap-4">
    <div class="flex flex-col">
      <span class="text-lg font-semibold text-highlighted">Edit Habit</span>
      <span class="text-sm text-muted">Update your habit details.</span>
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
