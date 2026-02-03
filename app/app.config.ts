export default defineAppConfig({
  ui: {
    modal: {
      slots: {
        header: "pb-0!",
        content: "divide-y-0",
      },
    },
    drawer: {
      slots: {
        footer: "pb-6",
      },
    },
    card: {
      slots: {
        root: "rounded-xl",
        header: "sm:p-4 pb-0! border-none",
        body: "sm:p-4 border-none",
        footer: "sm:p-4 pt-0! border-none",
      },
    },
    button: {
      defaultVariants: {
        size: "lg",
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
    },
    select: {
      defaultVariants: {
        size: "lg",
        variant: "subtle",
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
