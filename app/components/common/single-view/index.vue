<script setup lang="ts">
interface Props {
  title: string;
}

const { title } = defineProps<Props>();

const emit = defineEmits<{
  back: [];
}>();

/** Re-emits header back events to parent screens. */
const handleBack = (): void => {
  emit("back");
};
</script>

<template>
  <UContainer
    class="py-8"
    :style="{ paddingTop: 'calc(env(safe-area-inset-top) + 2rem)' }"
  >
    <div class="space-y-6">
      <CommonSingleViewHeader :title="title" @back="handleBack">
        <template #trailing>
          <slot name="header-trailing" />
        </template>
      </CommonSingleViewHeader>

      <div class="space-y-6">
        <slot />
      </div>
    </div>
  </UContainer>
</template>
