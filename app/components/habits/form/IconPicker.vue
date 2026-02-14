<script setup lang="ts">
defineProps<{ selectedIcon: string | null }>();

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

const loadIcons = async () => {
  if (iconClasses.value.length > 0 || isLoadingIcons.value) return;

  isLoadingIcons.value = true;
  loadError.value = null;

  try {
    iconClasses.value = await loadLucideIconClasses();
  } catch (error) {
    loadError.value = "Failed to load icons. Please try again.";
    console.error("Failed to load icons:", error);
  } finally {
    isLoadingIcons.value = false;
  }
};

const filteredIcons = computed(() => {
  if (!iconSearch.value.trim()) return iconClasses.value;
  const search = iconSearch.value.toLowerCase();
  return iconClasses.value.filter((icon) =>
    icon.toLowerCase().includes(search),
  );
});

const scrollToTop = () => {
  scrollArea.value?.virtualizer?.scrollToIndex(0, { behavior: "smooth" });
};

watch(open, async (isOpen) => {
  if (isOpen) {
    await loadIcons();
    iconSearch.value = "";
  }
});

watch(iconSearch, () => {
  scrollToTop();
});

const lanes = computed(() => (isDesktop.value ? 12 : 8));
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
              @click="
                emit('select', icon);
                open = false;
              "
            />
          </UScrollArea>
        </div>
      </div>
    </template>
  </CommonOverlay>
</template>
