<script setup lang="ts">
import type { AuthMode, AuthStep } from "~/types/auth";

interface Props {
  mode: AuthMode;
  step: AuthStep;
}

const { mode, step } = defineProps<Props>();

/** Primary auth heading shown above the form. */
const title = computed(() =>
  step === "verify"
    ? "Verify account with OTP"
    : mode === "register"
      ? "Sign up to Improveo"
      : "Log in to Improveo",
);

/** Secondary helper copy for the active mode. */
const subtitle = computed(() =>
  step === "verify"
    ? null
    : mode === "register"
      ? "Create an account to get started."
      : "Build better habits with a focused tracker that helps you stay consistent.",
);
</script>

<template>
  <div class="mb-2 flex flex-col gap-2">
    <UColorModeImage
      light="/logo-light.svg"
      dark="/logo-dark.svg"
      alt="Improveo Logo"
      class="h-11 w-11"
    />

    <span class="text-lg text-highlighted">
      {{ title }}
    </span>

    <p v-if="subtitle" class="text-sm text-muted">
      {{ subtitle }}
    </p>
  </div>
</template>
