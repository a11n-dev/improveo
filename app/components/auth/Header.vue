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
      ? "Join Improveo today and start building better habits with our focused habit tracker."
      : "Build better habits with a focused tracker that helps you stay consistent.",
);
</script>

<template>
  <div class="flex flex-col gap-2 mb-3">
    <UColorModeImage
      light="/logo-light.svg"
      dark="/logo-dark.svg"
      alt="Improveo Logo"
      class="h-12 w-12"
    />

    <div>
      <span class="text-lg text-highlighted">
        {{ title }}
      </span>

      <p v-if="subtitle" class="text-sm text-muted">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>
