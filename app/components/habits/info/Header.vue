<script setup lang="ts">
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
    <div class="flex flex-1 items-start gap-3">
      <div
        class="flex size-11 shrink-0 items-center justify-center rounded-lg"
        :style="{ backgroundColor: `${habit.color}20` }"
      >
        <UIcon
          :name="habit.icon"
          class="size-5.5"
          :style="{ color: habit.color }"
        />
      </div>

      <div class="flex min-w-0 flex-1 flex-col">
        <span class="wrap-break-word font-semibold text-highlighted">
          {{ habit.title }}
        </span>
        <span class="wrap-break-word text-sm text-muted">
          {{ habit.description || "No description" }}
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
