<script setup lang="ts">
const { draft, streakLabel } = useHabitDraft();

/** Streak editor open state */
const streakEditorOpen = ref(false);

/** Icon picker open state */
const iconPickerOpen = ref(false);

/** Custom color popover state */
const colorPickerOpen = ref(false);

/** Custom color value */
const customColor = ref("#3B82F6");

/** Select a preset color */
const selectColor = (color: string) => {
  draft.value.color = color;
};

/** Apply custom color */
const applyCustomColor = () => {
  draft.value.color = customColor.value;
  colorPickerOpen.value = false;
};

/** Select an icon */
const selectIcon = (icon: string) => {
  draft.value.icon = icon;
};
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- Name -->
    <UFormField label="Name" name="name" required>
      <UInput
        v-model="draft.name"
        placeholder="e.g. Morning meditation"
        class="w-full"
      />
    </UFormField>

    <!-- Description -->
    <UFormField label="Description" name="description">
      <UTextarea
        v-model="draft.description"
        placeholder="Optional description..."
        :rows="2"
        :maxrows="4"
        autoresize
        class="w-full"
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
    <HabitsCreateStreakEditor v-model:open="streakEditorOpen" />

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
                draft.icon === icon,
            }"
            :aria-label="icon.replace('i-lucide-', '')"
            @click="selectIcon(icon)"
          />
          <!-- Show selected custom icon in the grid -->
          <UButton
            v-if="
              draft.icon &&
              !habitIconPresets.includes(
                draft.icon as (typeof habitIconPresets)[number],
              )
            "
            :icon="draft.icon"
            square
            size="md"
            color="neutral"
            variant="soft"
            class="flex size-8 items-center justify-center rounded-md p-0 ring-2 ring-primary ring-offset-2 ring-offset-default"
            :aria-label="draft.icon.replace('i-lucide-', '')"
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
    <HabitsCreateIconPicker v-model:open="iconPickerOpen" />

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
              draft.color === color,
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
            draft.color &&
            !habitColorPresets.includes(
              draft.color as (typeof habitColorPresets)[number],
            )
          "
          square
          size="md"
          color="neutral"
          variant="ghost"
          class="size-8 rounded-md p-0 ring-2 ring-primary ring-offset-2 ring-offset-default"
          :style="{ backgroundColor: draft.color }"
          aria-label="Selected custom color"
          @click="colorPickerOpen = true"
        />
      </div>
    </UFormField>
  </div>
</template>
