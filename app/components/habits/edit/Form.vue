<script setup lang="ts">
const { draft, streakLabel } = useHabitEditDraft();
</script>

<template>
  <HabitsFormBase v-model:draft="draft" :streak-label="streakLabel" />
</template>
