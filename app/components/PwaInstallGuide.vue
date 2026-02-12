<script setup lang="ts">
/**
 * PWA Install Guide component.
 *
 * Displays browser-specific installation instructions in a responsive overlay.
 * Uses neutral styling for consistency across all browsers.
 */
import { getInstallGuide } from "~/utils/pwaInstallGuides";

const { isGuideOpen, closeGuide, browser, device, isIOS } = usePwaInstall();

const guide = computed(() => getInstallGuide(browser, device, isIOS));

const title = "Install Improveo";
const description = "Add to your home screen for quick access";
</script>

<template>
  <CommonOverlay
    v-model:open="isGuideOpen"
    :title="title"
    :description="description"
    :actions="[
      {
        label: 'Got it',
        color: 'primary',
        onClick: closeGuide,
      },
    ]"
  >
    <template #body>
      <div class="space-y-6">
        <!-- Browser/Device header -->
        <div class="flex items-center gap-3">
          <div
            class="flex size-10 items-center justify-center rounded-md bg-info-500/10 border border-info-500"
          >
            <UIcon :name="guide.headerIcon" class="size-5 text-info-500" />
          </div>
          <div>
            <h3 class="font-semibold text-highlighted">{{ guide.title }}</h3>
            <p class="text-sm text-muted">{{ guide.subtitle }}</p>
          </div>
        </div>

        <!-- Steps -->
        <div class="space-y-4">
          <div
            v-for="(step, index) in guide.steps"
            :key="index"
            class="flex items-start gap-3"
          >
            <div
              class="flex size-7 shrink-0 items-center justify-center rounded-sm border border-muted bg-muted/50 text-xs font-medium text-muted"
            >
              {{ index + 1 }}
            </div>
            <div class="flex-1">
              <p class="text-sm font-medium text-highlighted">
                {{ step.title }}
              </p>
              <p class="mt-0.5 text-xs text-muted">{{ step.subtitle }}</p>
            </div>
            <UIcon :name="step.icon" class="size-4 shrink-0 text-muted" />
          </div>
        </div>
      </div>
    </template>
  </CommonOverlay>
</template>
