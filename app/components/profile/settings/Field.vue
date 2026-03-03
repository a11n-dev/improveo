<script setup lang="ts">
type ProfileSettingsFieldVariant = "default" | "content";

interface Props {
  title?: string;
  description?: string;
  clickable?: boolean;
  icon?: string;
  showChevron?: boolean;
  value?: string;
  hideDescriptionOnMobile?: boolean;
  variant?: ProfileSettingsFieldVariant;
}

const {
  title = "",
  description = undefined,
  clickable = false,
  icon = undefined,
  showChevron = false,
  value = undefined,
  hideDescriptionOnMobile = true,
  variant = "default",
} = defineProps<Props>();

const emit = defineEmits<{
  click: [];
}>();

/** Button for interactive fields, static container for readonly fields. */
const rootTag = computed(() => (clickable ? "button" : "div"));

/** Hides descriptions on compact screens unless explicitly requested. */
const descriptionClass = computed(() =>
  hideDescriptionOnMobile
    ? "hidden text-xs text-muted md:block"
    : "text-xs text-muted",
);

/** Emits click only when the field is marked interactive. */
const handleClick = (): void => {
  if (!clickable) {
    return;
  }

  emit("click");
};
</script>

<template>
  <component
    :is="rootTag"
    :type="clickable ? 'button' : undefined"
    :class="[
      variant === 'content'
        ? 'w-full'
        : 'flex w-full items-center justify-between gap-4',
      clickable
        ? 'appearance-none border-0 bg-transparent cursor-pointer px-0 text-left'
        : '',
    ]"
    @click="handleClick"
  >
    <template v-if="variant === 'content'">
      <slot />
    </template>

    <template v-else>
      <div class="flex min-w-0 flex-1 items-center gap-3">
        <div
          v-if="icon"
          class="flex size-9 shrink-0 items-center justify-center rounded-md bg-info/15"
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
          <span v-if="value" class="text-sm text-muted md:-mt-0.5">{{
            value
          }}</span>
        </slot>

        <UIcon
          v-if="showChevron"
          name="i-lucide-chevron-right"
          class="size-5 text-highlighted"
        />
      </div>
    </template>
  </component>
</template>
