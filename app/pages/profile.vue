<script setup lang="ts">
import { AnimatePresence, MotionConfig, motion } from "motion-v";
import type { SingleViewPayload } from "~/types/singleview";

import { PROFILE_CACHE_KEY } from "~~/shared/constants/cache";

type PanelVariantState = {
  opacity: number;
  transform?: string;
};

type PanelVariants = {
  hidden: PanelVariantState;
  visible: PanelVariantState;
};

const REDUCED_MOTION_TRANSITION = { duration: 0 };
const SPRING_TRANSITION = {
  type: "spring" as const,
  stiffness: 380,
  damping: 36,
  mass: 0.9,
};

definePageMeta({
  keepalive: true,
});

const profileStore = useProfileStore();
const settingsStore = useSettingsStore();
const { profile } = storeToRefs(profileStore);
const { reduceAnimationsEnabled } = storeToRefs(settingsStore);
const { data: profileCache } = useNuxtData<ProfileWithSettings | null>(
  PROFILE_CACHE_KEY,
);
const isProfileShellShifted = useState<boolean>(
  "profile-shell-shifted",
  () => false,
);

const isLoading = computed(() => profileCache.value === undefined);
const hasError = computed(() => profileCache.value === null);

const activeView = shallowRef<SingleViewPayload | null>(null);
const motionReducedPolicy = computed(() =>
  reduceAnimationsEnabled.value ? "always" : "never",
);

const isDetailViewOpen = computed(() => activeView.value !== null);

/** Opens a full-screen profile subview. */
const openSettingsView = (view: SingleViewPayload): void => {
  activeView.value = view;
};

/** Closes the active profile subview and returns to the overview. */
const goBackToOverview = (): void => {
  activeView.value = null;
};

/** Props forwarded to the dynamic detail view component. */
const activeViewProps = computed<Record<string, unknown>>(
  () => activeView.value?.props ?? {},
);

/** Entrance/exit variants for the full-screen detail panel. */
const panelVariants = computed<PanelVariants>(() => {
  if (reduceAnimationsEnabled.value) {
    return {
      hidden: { opacity: 1, transform: "translateX(0%)" },
      visible: { opacity: 1, transform: "translateX(0%)" },
    };
  }

  return {
    hidden: { opacity: 1, transform: "translateX(100%)" },
    visible: { opacity: 1, transform: "translateX(0%)" },
  };
});

const panelTransition = computed(() =>
  reduceAnimationsEnabled.value ? REDUCED_MOTION_TRANSITION : SPRING_TRANSITION,
);

/** Keeps the layout shell shift in sync with detail panel visibility. */
watch(
  [isDetailViewOpen, reduceAnimationsEnabled],
  ([isOpen, isReduced]) => {
    isProfileShellShifted.value = !isReduced && isOpen;
  },
  { immediate: true },
);

onDeactivated(() => {
  activeView.value = null;
  isProfileShellShifted.value = false;
});

onBeforeUnmount(() => {
  isProfileShellShifted.value = false;
});
</script>

<template>
  <div>
    <UContainer class="py-8">
      <div
        v-if="isLoading"
        class="fixed inset-0 flex items-center justify-center"
      >
        <LoadingState />
      </div>

      <div
        v-else-if="hasError"
        class="fixed inset-0 flex items-center justify-center px-6"
      >
        <UEmpty
          title="Oops..."
          description="Something went wrong while loading your profile. Please try again later."
        />
      </div>

      <template v-else>
        <section>
          <ProfileUser v-if="profile" :profile="profile" />
        </section>

        <section v-if="profile" class="mt-8">
          <h2 class="mb-3 font-medium text-highlighted">Settings</h2>
          <UCard variant="subtle">
            <ProfileSettings @open-view="openSettingsView" />
          </UCard>
        </section>

        <section v-if="profile" class="mt-8">
          <ProfileActions />
        </section>
      </template>
    </UContainer>

    <Teleport to="body">
      <MotionConfig :reduced-motion="motionReducedPolicy">
        <AnimatePresence mode="wait">
          <motion.section
            v-if="activeView"
            :key="activeView.key"
            class="fixed inset-0 z-70 bg-default transform-gpu will-change-transform"
            :variants="panelVariants"
            initial="hidden"
            animate="visible"
            exit="hidden"
            :transition="panelTransition"
          >
            <CommonSingleView
              :title="activeView.title"
              @back="goBackToOverview"
            >
              <component :is="activeView.component" v-bind="activeViewProps" />
            </CommonSingleView>
          </motion.section>
        </AnimatePresence>
      </MotionConfig>
    </Teleport>
  </div>
</template>
