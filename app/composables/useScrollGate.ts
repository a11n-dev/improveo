import type { Ref } from "vue";

const SCROLL_GATE_DRAG_THRESHOLD = 4;

/**
 * Applies a mobile drawer scroll gate to prevent parent drag interception when
 * the inner content is scrolled to top and user swipes down.
 */
export const useScrollGate = (
  scrollGateEnabled: Ref<boolean>,
  drawerBodyRef: Ref<HTMLElement | null>,
) => {
  const isElementVerticallyScrollable = (element: HTMLElement): boolean => {
    const { overflowY } = window.getComputedStyle(element);

    return (
      ["auto", "scroll", "overlay"].includes(overflowY) &&
      element.scrollHeight > element.clientHeight
    );
  };

  const getClosestScrollableWithinContainer = (
    target: EventTarget | null,
    container: HTMLElement,
  ): HTMLElement => {
    if (!(target instanceof Node)) {
      return container;
    }

    let currentElement: HTMLElement | null =
      target instanceof HTMLElement ? target : target.parentElement;

    while (currentElement && currentElement !== container) {
      if (isElementVerticallyScrollable(currentElement)) {
        return currentElement;
      }

      currentElement = currentElement.parentElement;
    }

    return container;
  };

  const applyScrollGate = (container: HTMLElement): (() => void) => {
    let startY = 0;
    let activeScrollable: HTMLElement = container;

    const handleTouchStart = (event: TouchEvent) => {
      if (event.touches.length === 0) {
        return;
      }

      startY = event.touches[0]?.clientY ?? 0;
      activeScrollable = getClosestScrollableWithinContainer(
        event.target,
        container,
      );
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 0) {
        return;
      }

      const currentY = event.touches[0]?.clientY ?? 0;
      const deltaY = currentY - startY;

      if (deltaY <= SCROLL_GATE_DRAG_THRESHOLD) {
        return;
      }

      if (activeScrollable.scrollTop > 0) {
        return;
      }

      if (event.cancelable) {
        event.preventDefault();
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });

    return () => {
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  };

  let cleanup: (() => void) | null = null;

  /** Tears down active scroll-gate listeners. */
  const cleanupScrollGate = (): void => {
    cleanup?.();
    cleanup = null;
  };

  /** Installs or removes scroll-gate listeners based on current state. */
  const setupScrollGate = async (): Promise<void> => {
    if (!scrollGateEnabled.value) {
      cleanupScrollGate();
      return;
    }

    await nextTick();
    const container = drawerBodyRef.value?.closest('[data-slot="container"]');
    if (!(container instanceof HTMLElement)) {
      return;
    }

    cleanupScrollGate();
    cleanup = applyScrollGate(container);
  };

  watch(
    [scrollGateEnabled, drawerBodyRef],
    () => {
      void setupScrollGate();
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    cleanupScrollGate();
  });

  return {
    cleanupScrollGate,
    scrollGateEnabled,
    setupScrollGate,
  };
};
