<script setup lang="ts">
interface Props {
  title: string;
}

const { title } = defineProps<Props>();

const emit = defineEmits<{
  back: [];
}>();

/** Emits a back-navigation intent to parent wrappers. */
const handleBack = (): void => {
  emit("back");
};
</script>

<template>
  <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
    <UButton
      color="neutral"
      variant="ghost"
      icon="i-lucide-arrow-left"
      class="justify-self-start"
      @click="handleBack"
    />

    <span class="justify-self-center font-medium text-highlighted">
      {{ title }}
    </span>

    <div class="justify-self-end">
      <slot name="trailing" />
    </div>
  </div>
</template>
