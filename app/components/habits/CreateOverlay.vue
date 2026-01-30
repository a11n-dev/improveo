<script setup lang="ts">
import { createReusableTemplate } from "@vueuse/core";

const isDesktop = useIsDesktop();
const { isOpen, closeOverlay } = useHabitCreateOverlay();
const { isValid } = useHabitDraft();

const [DefineFormTemplate, ReuseFormTemplate] = createReusableTemplate();

const title = "Create Habit";
const description = "Add a new habit to track.";

/** Handle create (UI only for now) */
const handleCreate = () => {
  if (!isValid.value) return;
  // TODO: Actually create the habit
  closeOverlay();
};
</script>

<template>
  <!-- Reusable form template -->
  <DefineFormTemplate>
    <HabitsCreateForm />
  </DefineFormTemplate>

  <!-- Desktop: Modal -->
  <UModal
    v-if="isDesktop"
    v-model:open="isOpen"
    :title="title"
    :description="description"
    :close="{ onClick: closeOverlay }"
  >
    <template #body>
      <ReuseFormTemplate />
    </template>

    <template #footer>
      <div class="flex w-full flex-col gap-2">
        <UButton
          label="Create"
          color="primary"
          block
          :disabled="!isValid"
          @click="handleCreate"
        />
        <UButton
          label="Cancel"
          color="neutral"
          variant="subtle"
          block
          @click="closeOverlay"
        />
      </div>
    </template>
  </UModal>

  <!-- Mobile: Drawer -->
  <UDrawer
    v-else
    v-model:open="isOpen"
    :title="title"
    :description="description"
  >
    <template #body>
      <ReuseFormTemplate />
    </template>

    <template #footer>
      <UButton
        label="Create"
        color="primary"
        block
        class="justify-center"
        :disabled="!isValid"
        @click="handleCreate"
      />
      <UButton
        label="Cancel"
        color="neutral"
        variant="subtle"
        block
        class="justify-center"
        @click="closeOverlay"
      />
    </template>
  </UDrawer>
</template>
