export default defineAppConfig({
  ui: {
    colors: {
      neutral: "neutral",
    },
    modal: {
      slots: {
        header: "pb-0!",
        content: "divide-y-0",
      },
    },
    drawer: {
      slots: {
        container: "transform-gpu",
        content:
          "safe-drawer-content [--drawer-max-ratio:0.96] will-change-transform",
        footer: "pb-10 pt-6",
      },
    },
    card: {
      slots: {
        header: "sm:p-4 pb-0! border-none",
        body: "sm:p-4 border-none",
        footer: "sm:p-4 pt-0! border-none",
      },
    },
    button: {
      defaultVariants: {
        size: "lg",
        variant: "subtle",
      },
      variants: {
        size: {
          lg: {
            base: "px-3 py-2.5 md:py-2",
          },
        },
      },
      slots: {
        base: "cursor-pointer",
      },
    },
    input: {
      defaultVariants: {
        size: "lg",
        variant: "subtle",
      },
      variants: {
        size: {
          lg: {
            base: "px-3 py-2.5 md:py-2",
          },
        },
      },
    },
    select: {
      defaultVariants: {
        size: "lg",
        variant: "subtle",
      },
      variants: {
        size: {
          lg: {
            base: "px-3 py-2.5",
            label: "p-2.5",
            item: "p-2.5",
            empty: "p-2.5",
          },
        },
      },
    },
    empty: {
      slots: {
        root: "sm:p-4 lg:p-4",
      },
      defaultVariants: {
        variant: "naked",
      },
    },
  },
});
