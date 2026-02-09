<script setup lang="ts">
const { draft, goalLabel } = useHabitDraft();
</script>

<template>
  <HabitsFormBase v-model:draft="draft" :goal-label="goalLabel" />
</template>
