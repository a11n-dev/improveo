<script setup lang="ts">
import {
  HABIT_DESCRIPTION_MAX_LENGTH,
  HABIT_TITLE_MAX_LENGTH,
} from "~~/shared/constants/validation";
interface Props {
  /** The draft object to bind to */
  draft: {
    name: string;
    description: string;
    icon: string | null;
    color: HabitColor | null;
    goal: Goal | null;
  };
  /** Label for the goal button */
  goalLabel: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:draft": [
    draft: {
      name: string;
      description: string;
      icon: string | null;
      color: HabitColor | null;
      goal: Goal | null;
    },
  ];
}>();

/** Goal editor open state */
const goalEditorOpen = ref(false);

/** Icon picker open state */
const iconPickerOpen = ref(false);

/** Custom color popover state */
const colorPickerOpen = ref(false);

/** Custom color value */
const customColor = ref("#3B82F6");

/** Local draft reference for v-model binding */
const localDraft = computed({
  get: () => props.draft,
  set: (value) => emit("update:draft", value),
});

const isCustomIconSelected = computed(() => {
  if (!localDraft.value.icon) {
    return false;
  }

  return !habitIconPresets.includes(
    localDraft.value.icon as (typeof habitIconPresets)[number],
  );
});

const displayedIconPresets = computed(() => {
  if (!isCustomIconSelected.value || !localDraft.value.icon) {
    return habitIconPresets;
  }

  return [
    ...habitIconPresets.slice(0, -1),
    localDraft.value.icon,
  ] as ReadonlyArray<string>;
});

const isCustomColorSelected = computed(() => {
  if (!localDraft.value.color) {
    return false;
  }

  return !habitColorPresets.includes(
    localDraft.value.color as (typeof habitColorPresets)[number],
  );
});

const displayedColorPresets = computed(() => {
  if (!isCustomColorSelected.value || !localDraft.value.color) {
    return habitColorPresets;
  }

  return [
    ...habitColorPresets.slice(0, -1),
    localDraft.value.color,
  ] as ReadonlyArray<string>;
});

/** Update a specific field in the draft */
const updateField = <K extends keyof typeof props.draft>(
  field: K,
  value: (typeof props.draft)[K],
) => {
  emit("update:draft", { ...props.draft, [field]: value });
};

/** Select a preset color */
const selectColor = (color: string) => {
  updateField("color", color as HabitColor);
};

/** Apply custom color */
const applyCustomColor = () => {
  updateField("color", customColor.value as HabitColor);
  colorPickerOpen.value = false;
};

/** Select an icon */
const selectIcon = (icon: string) => {
  updateField("icon", icon);
};

/** Handle goal change from editor */
const handleGoalChange = (goal: Goal | null) => {
  updateField("goal", goal);
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Name -->
    <UFormField label="Name" name="name" required>
      <UInput
        :model-value="localDraft.name"
        placeholder="e.g. Morning meditation"
        class="w-full"
        :maxlength="HABIT_TITLE_MAX_LENGTH"
        :ui="{ base: 'pr-14', trailing: 'pointer-events-none pr-2' }"
        @update:model-value="updateField('name', $event as string)"
      >
        <template #trailing>
          <div
            id="habit-name-count"
            class="text-xs text-muted tabular-nums"
            aria-live="polite"
            role="status"
          >
            {{ localDraft.name.length }}/{{ HABIT_TITLE_MAX_LENGTH }}
          </div>
        </template>
      </UInput>
    </UFormField>

    <!-- Description -->
    <UFormField label="Description" name="description">
      <UInput
        :model-value="localDraft.description"
        placeholder="Optional (e.g. 10 minutes before work)"
        class="w-full"
        :maxlength="HABIT_DESCRIPTION_MAX_LENGTH"
        :ui="{ base: 'pr-14', trailing: 'pointer-events-none pr-2' }"
        @update:model-value="updateField('description', $event as string)"
      >
        <template #trailing>
          <div
            id="habit-description-count"
            class="text-xs text-muted tabular-nums"
            aria-live="polite"
            role="status"
          >
            {{ localDraft.description.length }}/{{
              HABIT_DESCRIPTION_MAX_LENGTH
            }}
          </div>
        </template>
      </UInput>
    </UFormField>

    <!-- Goal -->
    <UFormField label="Goal" name="goal">
      <UButton
        :label="goalLabel"
        trailing-icon="i-lucide-chevron-right"
        color="neutral"
        block
        class="justify-between"
        @click="goalEditorOpen = true"
      />
    </UFormField>

    <!-- Nested goal editor -->
    <HabitsFormGoalEditor
      v-model:open="goalEditorOpen"
      :goal="localDraft.goal"
      @update:goal="handleGoalChange"
    />

    <!-- Icon -->
    <UFormField label="Icon" name="icon" required>
      <div class="flex flex-col gap-4">
        <!-- Icon presets grid -->
        <div
          class="grid grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-1.5 md:grid-cols-12"
        >
          <UButton
            v-for="icon in displayedIconPresets"
            :key="icon"
            :icon="icon"
            square
            size="md"
            color="neutral"
            variant="soft"
            class="flex size-9.5 items-center justify-center rounded-md p-0 md:size-8.5"
            :class="{
              'ring-2 ring-primary': localDraft.icon === icon,
            }"
            :aria-label="icon.replace('i-lucide-', '')"
            @click="selectIcon(icon)"
          />
        </div>
        <!-- Browse all icons button -->
        <UButton
          label="Browse all icons"
          icon="i-lucide-layout-grid"
          color="neutral"
          block
          class="justify-center"
          @click="iconPickerOpen = true"
        />
      </div>
    </UFormField>

    <!-- Nested icon picker -->
    <HabitsFormIconPicker
      v-model:open="iconPickerOpen"
      :selected-icon="localDraft.icon"
      @select="selectIcon"
    />

    <!-- Color -->
    <UFormField label="Color" name="color" required>
      <div
        class="grid grid-cols-[repeat(auto-fill,minmax(36px,1fr))] gap-1.5 md:grid-cols-12"
      >
        <UButton
          v-for="color in displayedColorPresets"
          :key="color"
          square
          size="md"
          color="neutral"
          variant="ghost"
          class="size-9 rounded-md p-0 md:size-8"
          :class="{
            'ring-2 ring-primary': localDraft.color === color,
          }"
          :style="{ backgroundColor: color }"
          :aria-label="`Select color ${color}`"
          @click="selectColor(color)"
        />
        <UPopover v-model:open="colorPickerOpen">
          <UButton
            icon="i-lucide-palette"
            square
            size="md"
            color="neutral"
            variant="soft"
            class="flex size-9.5 items-center justify-center rounded-md p-0 md:size-8.5"
            aria-label="Custom color"
          />
          <template #content>
            <div class="flex flex-col gap-2 p-2">
              <UColorPicker v-model="customColor" />
              <UButton
                label="Apply"
                size="sm"
                color="neutral"
                variant="solid"
                @click="applyCustomColor"
              />
            </div>
          </template>
        </UPopover>
      </div>
    </UFormField>
  </div>
</template>
