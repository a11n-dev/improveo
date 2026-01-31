<script setup lang="ts">
import { createReusableTemplate, useInfiniteScroll } from "@vueuse/core";

import { lucideIconClasses } from "~/utils/icons";

const isDesktop = useIsDesktop();
const { draft } = useHabitDraft();

const open = defineModel<boolean>("open", { default: false });

/** Number of icons to load per batch */
const BATCH_SIZE = 80;

/** Icon search term */
const iconSearch = ref("");

/** Number of icons currently loaded */
const loadedCount = ref(BATCH_SIZE);

/** Scroll container ref for infinite scroll */
const scrollContainerRef = ref<HTMLElement | null>(null);

/** Whether there are more icons to load */
const canLoadMore = ref(true);

/** All filtered icons (based on search) */
const allFilteredIcons = computed(() => {
  if (!iconSearch.value.trim()) {
    return lucideIconClasses;
  }
  const search = iconSearch.value.toLowerCase();
  return lucideIconClasses.filter((icon) =>
    icon.toLowerCase().includes(search),
  );
});

/** Icons to display (paginated) */
const displayedIcons = computed(() => {
  return allFilteredIcons.value.slice(0, loadedCount.value);
});

/** Load more icons */
const loadMore = () => {
  if (loadedCount.value >= allFilteredIcons.value.length) {
    canLoadMore.value = false;
    return;
  }
  loadedCount.value = Math.min(
    loadedCount.value + BATCH_SIZE,
    allFilteredIcons.value.length,
  );
};

/** Setup infinite scroll */
useInfiniteScroll(scrollContainerRef, loadMore, {
  distance: 100,
  canLoadMore: () => canLoadMore.value,
});

/** Select an icon and close */
const selectIcon = (icon: string) => {
  draft.value.icon = icon;
  open.value = false;
};

/** Reset state when opening or search changes */
watch(open, (isOpen) => {
  if (isOpen) {
    iconSearch.value = "";
    loadedCount.value = BATCH_SIZE;
    canLoadMore.value = true;
  }
});

watch(iconSearch, () => {
  loadedCount.value = BATCH_SIZE;
  canLoadMore.value = true;
});

const title = "Choose Icon";

const [DefineBodyTemplate, ReuseBodyTemplate] = createReusableTemplate();
const [DefineFooterTemplate, ReuseFooterTemplate] = createReusableTemplate();
</script>

<template>
  <!-- Define reusable body template -->
  <DefineBodyTemplate>
    <div class="flex flex-col">
      <!-- Sticky search -->
      <div class="sticky top-0 z-10 bg-default/80 backdrop-blur-sm">
        <UInput
          v-model="iconSearch"
          placeholder="Search icons..."
          icon="i-lucide-search"
          class="w-full"
          :autofocus="isDesktop"
        />
      </div>

      <!-- Scrollable icon grid -->
      <div ref="scrollContainerRef" class="max-h-64 overflow-y-auto pt-3">
        <div
          class="grid gap-1.5 p-0.5"
          style="grid-template-columns: repeat(auto-fill, minmax(32px, 1fr))"
        >
          <UButton
            v-for="icon in displayedIcons"
            :key="icon"
            :icon="icon"
            square
            size="md"
            color="neutral"
            variant="soft"
            class="flex size-8 items-center justify-center rounded-md p-0"
            :class="{
              'ring-2 ring-primary': draft.icon === icon,
            }"
            :aria-label="icon.replace('i-lucide-', '')"
            @click="selectIcon(icon)"
          />
        </div>

        <!-- Loading indicator -->
        <p
          v-if="canLoadMore && displayedIcons.length > 0"
          class="py-4 text-center text-xs text-muted"
        >
          Scroll for more...
        </p>

        <!-- No results -->
        <p
          v-if="displayedIcons.length === 0"
          class="py-8 text-center text-sm text-muted"
        >
          No icons found
        </p>

        <!-- All loaded indicator -->
        <p
          v-if="!canLoadMore && displayedIcons.length > 0"
          class="py-2 text-center text-xs text-muted"
        >
          {{ displayedIcons.length }} icons
        </p>
      </div>
    </div>
  </DefineBodyTemplate>

  <!-- Define reusable footer template -->
  <DefineFooterTemplate>
    <UButton
      label="Cancel"
      color="neutral"
      variant="subtle"
      block
      class="justify-center"
      @click="open = false"
    />
  </DefineFooterTemplate>

  <UModal
    v-if="isDesktop"
    v-model:open="open"
    :title="title"
    :ui="{ footer: 'justify-end pt-0' }"
  >
    <template #body>
      <ReuseBodyTemplate />
    </template>
    <template #footer>
      <ReuseFooterTemplate />
    </template>
  </UModal>

  <UDrawer v-else v-model:open="open" nested :title="title">
    <template #body>
      <ReuseBodyTemplate />
    </template>
    <template #footer>
      <ReuseFooterTemplate />
    </template>
  </UDrawer>
</template>
