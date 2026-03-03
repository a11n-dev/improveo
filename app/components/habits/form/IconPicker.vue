<script setup lang="ts">
interface Props {
  selectedIcon: string | null;
}

const { selectedIcon } = defineProps<Props>();

const emit = defineEmits<{
  select: [icon: string];
}>();

const isDesktop = useIsDesktop();
const open = defineModel<boolean>("open", { default: false });

const iconSearch = ref("");
const iconClasses = shallowRef<string[]>([]);
const isLoadingIcons = ref(false);
const loadError = ref<string | null>(null);
const scrollArea = useTemplateRef("scrollArea");

/** Loads available Lucide icons once per component instance. */
const loadIcons = async (): Promise<void> => {
  if (iconClasses.value.length > 0 || isLoadingIcons.value) {
    return;
  }

  isLoadingIcons.value = true;
  loadError.value = null;

  try {
    iconClasses.value = await loadLucideIconClasses();
  } catch (caughtError) {
    loadError.value = "Failed to load icons. Please try again.";
    console.error("Failed to load icons:", caughtError);
  } finally {
    isLoadingIcons.value = false;
  }
};

/** Filters icon list by current search query. */
const filteredIcons = computed<string[]>(() => {
  if (!iconSearch.value.trim()) {
    return iconClasses.value;
  }

  const search = iconSearch.value.toLowerCase();

  return iconClasses.value.filter((icon) =>
    icon.toLowerCase().includes(search),
  );
});

/** Resets virtualized scroll to top after search input changes. */
const scrollToTop = (): void => {
  scrollArea.value?.virtualizer?.scrollToIndex(0, { behavior: "smooth" });
};

/** Emits selected icon and closes the picker overlay. */
const handleSelectIcon = (icon: string): void => {
  emit("select", icon);
  open.value = false;
};

/** Loads icons lazily and clears search each time the picker opens. */
watch(open, async (isOpen): Promise<void> => {
  if (!isOpen) {
    return;
  }

  await loadIcons();
  iconSearch.value = "";
});

/** Keeps the first search result row visible when filtering. */
watch(iconSearch, (): void => {
  scrollToTop();
});

/** Adapts virtual grid columns for desktop and mobile layouts. */
const lanes = computed<number>(() => (isDesktop.value ? 12 : 8));
</script>

<template>
  <CommonOverlay
    v-model:open="open"
    title="Choose Icon"
    :modal-props="{ ui: { footer: 'justify-end pt-0' } }"
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

        <div class="h-80">
          <LoadingState v-if="isLoadingIcons" class="h-full" />

          <UEmpty
            v-else-if="loadError"
            title="Failed to load icons"
            :description="loadError"
            class="h-full"
            :actions="[
              {
                icon: 'i-lucide-refresh-cw',
                label: 'Retry',
                color: 'neutral',
                onClick: loadIcons,
              },
            ]"
          />

          <UEmpty
            v-else-if="filteredIcons.length === 0"
            title="No icons found"
            description="Try adjusting your search terms"
            class="h-full"
          />

          <UScrollArea
            v-else
            ref="scrollArea"
            v-slot="{ item: icon }"
            :items="filteredIcons"
            :virtualize="{ lanes, estimateSize: 40, gap: 6 }"
            class="h-full pt-3"
          >
            <UButton
              :key="icon"
              :icon="icon"
              square
              size="md"
              color="neutral"
              variant="soft"
              class="flex size-9 items-center justify-center rounded-md p-0"
              :class="{ 'ring-2 ring-primary': selectedIcon === icon }"
              :aria-label="icon.replace('i-lucide-', '')"
              @click="handleSelectIcon(icon)"
            />
          </UScrollArea>
        </div>
      </div>
    </template>
  </CommonOverlay>
</template>
