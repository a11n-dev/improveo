<script setup lang="ts">
import type { Habit } from "~/types/habit";

interface Props {
  habit: Habit;
}

const { habit } = defineProps<Props>();

const emit = defineEmits<{
  "toggle-date": [date: string];
  edit: [];
}>();

const open = defineModel<boolean>("open", { default: false });

const modalProps = {
  close: false,
  ui: { footer: "flex-col gap-2" },
};

/** Handle edit button click */
const handleEdit = () => {
  emit("edit");
};

/** Close overlay */
const handleClose = () => {
  open.value = false;
};
</script>

<template>
  <HabitsOverlayResponsive v-model:open="open" :modal-props="modalProps">
    <template #header>
      <HabitsInfoHeader :habit="habit" @close="handleClose" />
    </template>

    <template #body>
      <div
        class="flex flex-col gap-4"
        :style="{
          '--habit-color': habit.color,
          '--habit-color-hover': `color-mix(in srgb, ${habit.color} 70%, white)`,
          '--habit-color-light': `${habit.color}20`,
        }"
      >
        <HabitsGraph
          :color="habit.color"
          :completions="habit.completions"
          :show-legend="true"
          :show-totals="true"
        />

        <HabitsInfoSummary :habit="habit" />

        <HabitsInfoCalendar
          :habit="habit"
          :open="open"
          @toggle-date="emit('toggle-date', $event)"
        />
      </div>
    </template>

    <template #footer>
      <UButton
        label="Edit"
        color="neutral"
        variant="outline"
        block
        class="justify-center"
        @click="handleEdit"
      />
      <UButton
        label="Close"
        color="neutral"
        variant="subtle"
        block
        class="justify-center"
        @click="handleClose"
      />
    </template>
  </HabitsOverlayResponsive>
</template>
