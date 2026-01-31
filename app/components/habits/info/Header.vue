<script setup lang="ts">
import type { Habit } from "~/types/habit";

interface Props {
  habit: Habit;
}

const { habit } = defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div class="flex w-full items-start justify-between gap-3">
    <div class="flex items-center gap-3">
      <div
        class="flex size-12 shrink-0 items-center justify-center rounded-lg"
        :style="{ backgroundColor: `${habit.color}20` }"
      >
        <UIcon
          :name="habit.icon"
          class="size-6"
          :style="{ color: habit.color }"
        />
      </div>

      <div class="flex min-w-0 flex-col">
        <span class="truncate text-lg font-semibold text-highlighted">
          {{ habit.title }}
        </span>
        <span class="truncate text-sm text-muted">
          {{ habit.description || "No Description" }}
        </span>
      </div>
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
