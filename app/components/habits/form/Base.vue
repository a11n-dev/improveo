<script setup lang="ts">
import type { HabitFormDraft } from "~/types/habit";

import {
  HABIT_DESCRIPTION_MAX_LENGTH,
  HABIT_TITLE_MAX_LENGTH,
} from "~~/shared/constants/validation";

interface Props {
  draft: HabitFormDraft;
  goalLabel: string;
}

const { draft, goalLabel } = defineProps<Props>();

const emit = defineEmits<{
  "update:draft": [draft: HabitFormDraft];
}>();

/** Controls nested goal editor visibility. */
const goalEditorOpen = ref(false);
/** Controls nested icon picker visibility. */
const iconPickerOpen = ref(false);

/**
 * Provides a writable draft bridge for child inputs.
 * Writes are emitted to keep source of truth in the parent overlay.
 */
const localDraft = computed({
  get: (): HabitFormDraft => draft,
  set: (value: HabitFormDraft): void => {
    emit("update:draft", value);
  },
});

/** Detects whether the selected icon is outside predefined icon presets. */
const isCustomIconSelected = computed<boolean>(() => {
  if (!localDraft.value.icon) {
    return false;
  }

  return !habitIconPresets.includes(
    localDraft.value.icon as (typeof habitIconPresets)[number],
  );
});

/** Includes selected custom icon in the visible presets grid. */
const displayedIconPresets = computed<ReadonlyArray<string>>(() => {
  if (!isCustomIconSelected.value || !localDraft.value.icon) {
    return habitIconPresets;
  }

  return [...habitIconPresets.slice(0, -1), localDraft.value.icon];
});

/** Detects whether the selected color is outside predefined color presets. */
const isCustomColorSelected = computed<boolean>(() => {
  if (!localDraft.value.color) {
    return false;
  }

  return !habitColorPresets.includes(
    localDraft.value.color as (typeof habitColorPresets)[number],
  );
});

/** Includes selected custom color in the visible preset palette. */
const displayedColorPresets = computed<ReadonlyArray<string>>(() => {
  if (!isCustomColorSelected.value || !localDraft.value.color) {
    return habitColorPresets;
  }

  return [...habitColorPresets.slice(0, -1), localDraft.value.color];
});

/** Updates a single draft field while preserving other values. */
const updateField = <Key extends keyof HabitFormDraft>(
  field: Key,
  value: HabitFormDraft[Key],
): void => {
  emit("update:draft", { ...draft, [field]: value } as HabitFormDraft);
};

/** Applies a preset color selection to the habit draft. */
const selectColor = (color: string): void => {
  updateField("color", color);
};

/** Applies icon selection to the habit draft. */
const selectIcon = (icon: string): void => {
  updateField("icon", icon);
};

/** Syncs goal editor output back into the habit draft. */
const handleGoalChange = (goal: Goal | null): void => {
  updateField("goal", goal);
};
</script>

<template>
  <div class="flex flex-col gap-4">
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

    <HabitsFormGoalEditor
      v-model:open="goalEditorOpen"
      :goal="localDraft.goal"
      @update:goal="handleGoalChange"
    />

    <UFormField label="Icon" name="icon" required>
      <div class="flex flex-col gap-4">
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

    <HabitsFormIconPicker
      v-model:open="iconPickerOpen"
      :selected-icon="localDraft.icon"
      @select="selectIcon"
    />

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
      </div>
    </UFormField>
  </div>
</template>
