<script setup lang="ts">
const { draft, goalLabel } = useHabitEditDraft();
</script>

<template>
  <HabitsFormBase v-model:draft="draft" :goal-label="goalLabel" />
</template>
