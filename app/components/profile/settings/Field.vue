<script setup lang="ts">
const {
  description = undefined,
  clickable = false,
  icon = undefined,
  showChevron = false,
  value = undefined,
  hideDescriptionOnMobile = true,
} = defineProps<{
  title: string;
  description?: string;
  clickable?: boolean;
  icon?: string;
  showChevron?: boolean;
  value?: string;
  hideDescriptionOnMobile?: boolean;
}>();

const emit = defineEmits<{
  click: [];
}>();

const rootTag = computed(() => (clickable ? "button" : "div"));

const descriptionClass = computed(() =>
  hideDescriptionOnMobile
    ? "hidden text-xs text-muted md:block"
    : "text-xs text-muted",
);
</script>

<template>
  <component
    :is="rootTag"
    :type="clickable ? 'button' : undefined"
    class="flex min-h-10 w-full items-center justify-between gap-4"
    :class="
      clickable
        ? 'appearance-none border-0 bg-transparent cursor-pointer px-0 text-left'
        : ''
    "
    @click="clickable && emit('click')"
  >
    <div class="flex min-w-0 flex-1 items-center gap-3">
      <div
        v-if="icon"
        class="flex size-10 shrink-0 items-center justify-center rounded-md bg-info/15"
      >
        <UIcon :name="icon" class="size-5 text-info" />
      </div>

      <div class="min-w-0 flex-1">
        <span class="text-sm font-medium text-highlighted">{{ title }}</span>
        <p v-if="description" :class="descriptionClass">{{ description }}</p>
      </div>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <slot name="trailing">
        <span v-if="value" class="text-sm text-muted -mt-0.5">{{ value }}</span>
      </slot>

      <UIcon
        v-if="showChevron"
        name="i-lucide-chevron-right"
        class="size-5 text-highlighted"
      />
    </div>
  </component>
</template>
