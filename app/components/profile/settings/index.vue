<script setup lang="ts">
import ColorMode from "./ColorMode.vue";
import WeekStart from "./WeekStart.vue";

/**
 * Props for the ProfileSettings component.
 */
interface Props {
  /** The user profile data containing week_start preference. */
  profile: Profile;
}

/**
 * Emits for the ProfileSettings component.
 */
interface Emits {
  /** Emitted when week start value changes. */
  (e: "update:weekStart", value: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

/**
 * Handle week start change and emit to parent.
 */
const handleWeekStartChange = (value: number): void => {
  emit("update:weekStart", value);
};
</script>

<template>
  <div class="divide-y divide-default">
    <div class="pb-4">
      <ColorMode />
    </div>
    <div class="pt-4">
      <WeekStart
        :model-value="profile.weekStart"
        @update:model-value="handleWeekStartChange"
      />
    </div>
  </div>
</template>
