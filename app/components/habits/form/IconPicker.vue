<script setup lang="ts">
import { useInfiniteScroll } from "@vueuse/core";

interface Props {
  selectedIcon: string | null;
}

defineProps<Props>();

const emit = defineEmits<{
  select: [icon: string];
}>();

const isDesktop = useIsDesktop();

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

/** Loaded icon list (lazy) */
const iconClasses = ref<string[]>([]);
const isLoadingIcons = ref(false);

const loadIconsIfNeeded = async () => {
  if (iconClasses.value.length > 0 || isLoadingIcons.value) {
    return;
  }
  isLoadingIcons.value = true;
  try {
    iconClasses.value = await loadLucideIconClasses();
  } finally {
    isLoadingIcons.value = false;
  }
};

/** All filtered icons (based on search) */
const allFilteredIcons = computed(() => {
  if (!iconSearch.value.trim()) {
    return iconClasses.value;
  }
  const search = iconSearch.value.toLowerCase();
  return iconClasses.value.filter((icon) =>
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
  emit("select", icon);
  open.value = false;
};

/** Reset state when opening or search changes */
watch(open, async (isOpen) => {
  if (isOpen) {
    await loadIconsIfNeeded();
    iconSearch.value = "";
    loadedCount.value = BATCH_SIZE;
    canLoadMore.value = true;
  }
});

watch(iconSearch, () => {
  loadedCount.value = BATCH_SIZE;
  canLoadMore.value = true;
});
</script>

<template>
  <CommonOverlay
    v-model:open="open"
    title="Choose Icon"
    :modal-props="{
      ui: { footer: 'justify-end pt-0' },
    }"
    :drawer-props="{
      nested: true,
    }"
  >
    <template #body>
      <div class="flex flex-col">
        <div class="sticky top-0 z-10 bg-default/80 backdrop-blur-sm">
          <UInput
            v-model="iconSearch"
            placeholder="Search icons..."
            icon="i-lucide-search"
            class="w-full"
            :autofocus="isDesktop"
          />
        </div>

        <div ref="scrollContainerRef" class="max-h-100 overflow-y-auto pt-3">
          <div
            class="grid grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-1.5 p-0.5 md:grid-cols-[repeat(auto-fill,minmax(32px,1fr))]"
          >
            <UButton
              v-for="icon in displayedIcons"
              :key="icon"
              :icon="icon"
              square
              size="md"
              color="neutral"
              variant="soft"
              class="flex size-9.5 items-center justify-center rounded-md p-0 md:size-8.5"
              :class="{
                'ring-2 ring-primary': selectedIcon === icon,
              }"
              :aria-label="icon.replace('i-lucide-', '')"
              @click="selectIcon(icon)"
            />
          </div>

          <p v-if="isLoadingIcons" class="py-8 text-center text-sm text-muted">
            Loading icons...
          </p>

          <p
            v-else-if="displayedIcons.length === 0"
            class="py-8 text-center text-sm text-muted"
          >
            No icons found
          </p>

          <p
            v-if="!canLoadMore && displayedIcons.length > 0"
            class="py-2 text-center text-xs text-muted"
          >
            {{ displayedIcons.length }} icons
          </p>
        </div>
      </div>
    </template>
  </CommonOverlay>
</template>
