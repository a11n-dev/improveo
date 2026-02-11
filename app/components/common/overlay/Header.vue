<script setup lang="ts">
interface Props {
  title?: string;
  description?: string;
  icon?: string;
}

defineProps<Props>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <div class="flex w-full items-start justify-between gap-3">
    <div class="flex min-w-0 flex-1 items-start gap-3">
      <UIcon
        v-if="icon"
        :name="icon"
        class="mt-0.5 size-5 shrink-0 text-highlighted"
      />

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
      variant="ghost"
      aria-label="Close"
      @click="emit('close')"
    />
  </div>
</template>
