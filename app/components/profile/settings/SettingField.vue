<script setup lang="ts">
interface Props {
  title: string;
  description?: string;
  clickable?: boolean;
  showChevron?: boolean;
  value?: string;
  hideDescriptionOnMobile?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  description: undefined,
  clickable: false,
  showChevron: false,
  value: undefined,
  hideDescriptionOnMobile: true,
});

const emit = defineEmits<{
  click: [];
}>();

const rootTag = computed(() => (props.clickable ? "button" : "div"));

const descriptionClass = computed(() =>
  props.hideDescriptionOnMobile
    ? "hidden text-xs text-muted md:block"
    : "text-xs text-muted",
);

const handleClick = (): void => {
  if (props.clickable) {
    emit("click");
  }
};
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
    @click="handleClick"
  >
    <div class="min-w-0 flex-1">
      <span class="text-sm font-medium text-highlighted">{{ title }}</span>
      <p v-if="description" :class="descriptionClass">{{ description }}</p>
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
