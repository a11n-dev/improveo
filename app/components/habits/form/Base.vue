<script setup lang="ts">
interface Props {
  /** The draft object to bind to */
  draft: {
    name: string;
    description: string;
    icon: string | null;
    color: HabitColor | null;
    streak: StreakGoal | null;
  };
  /** Label for the streak button */
  streakLabel: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:draft": [
    draft: {
      name: string;
      description: string;
      icon: string | null;
      color: HabitColor | null;
      streak: StreakGoal | null;
    },
  ];
}>();

/** Streak editor open state */
const streakEditorOpen = ref(false);

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

/** Handle streak change from editor */
const handleStreakChange = (streak: StreakGoal | null) => {
  updateField("streak", streak);
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
        @update:model-value="updateField('name', $event as string)"
      />
    </UFormField>

    <!-- Description -->
    <UFormField label="Description" name="description">
      <UInput
        :model-value="localDraft.description"
        placeholder="Optional description..."
        class="w-full"
        @update:model-value="updateField('description', $event as string)"
      />
    </UFormField>

    <!-- Streak Goal -->
    <UFormField label="Streak Goal" name="streak">
      <UButton
        :label="streakLabel"
        trailing-icon="i-lucide-chevron-right"
        color="neutral"
        variant="subtle"
        block
        class="justify-between"
        @click="streakEditorOpen = true"
      />
    </UFormField>

    <!-- Nested streak editor -->
    <HabitsFormStreakEditor
      v-model:open="streakEditorOpen"
      :streak="localDraft.streak"
      @update:streak="handleStreakChange"
    />

    <!-- Icon -->
    <UFormField label="Icon" name="icon" required>
      <div class="flex flex-col gap-4">
        <!-- Icon presets grid -->
        <div
          class="grid gap-1.5"
          style="grid-template-columns: repeat(auto-fill, minmax(32px, 1fr))"
        >
          <UButton
            v-for="icon in habitIconPresets"
            :key="icon"
            :icon="icon"
            square
            size="md"
            color="neutral"
            variant="soft"
            class="flex size-8 items-center justify-center rounded-md p-0"
            :class="{
              'ring-2 ring-primary ring-offset-2 ring-offset-default':
                localDraft.icon === icon,
            }"
            :aria-label="icon.replace('i-lucide-', '')"
            @click="selectIcon(icon)"
          />
          <!-- Show selected custom icon in the grid -->
          <UButton
            v-if="
              localDraft.icon &&
              !habitIconPresets.includes(
                localDraft.icon as (typeof habitIconPresets)[number],
              )
            "
            :icon="localDraft.icon"
            square
            size="md"
            color="neutral"
            variant="soft"
            class="flex size-8 items-center justify-center rounded-md p-0 ring-2 ring-primary ring-offset-2 ring-offset-default"
            :aria-label="localDraft.icon.replace('i-lucide-', '')"
            @click="iconPickerOpen = true"
          />
        </div>
        <!-- Browse all icons button -->
        <UButton
          label="Browse all icons"
          icon="i-lucide-layout-grid"
          color="neutral"
          variant="subtle"
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
        class="grid gap-1.5"
        style="grid-template-columns: repeat(auto-fill, minmax(32px, 1fr))"
      >
        <UButton
          v-for="color in habitColorPresets"
          :key="color"
          square
          size="md"
          color="neutral"
          variant="ghost"
          class="size-8 rounded-md p-0"
          :class="{
            'ring-2 ring-primary ring-offset-2 ring-offset-default':
              localDraft.color === color,
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
            class="flex size-8 items-center justify-center rounded-md p-0"
            aria-label="Custom color"
          />
          <template #content>
            <div class="flex flex-col gap-2 p-2">
              <UColorPicker v-model="customColor" />
              <UButton
                label="Apply"
                size="sm"
                color="neutral"
                @click="applyCustomColor"
              />
            </div>
          </template>
        </UPopover>
        <UButton
          v-if="
            localDraft.color &&
            !habitColorPresets.includes(
              localDraft.color as (typeof habitColorPresets)[number],
            )
          "
          square
          size="md"
          color="neutral"
          variant="ghost"
          class="size-8 rounded-md p-0 ring-2 ring-primary ring-offset-2 ring-offset-default"
          :style="{ backgroundColor: localDraft.color }"
          aria-label="Selected custom color"
          @click="colorPickerOpen = true"
        />
      </div>
    </UFormField>
  </div>
</template>
