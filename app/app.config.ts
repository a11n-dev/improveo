export default defineAppConfig({
  ui: {
    drawer: {
      compoundVariants: [
        {
          direction: ["top", "bottom"],
          class: {
            content: "h-auto max-h-[65dvh]",
          },
        },
      ],
    },
    modal: {
      slots: {
        content: "divide-y-0",
        footer: "pt-0",
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
      slots: {
        base: "cursor-pointer",
      },
    },
    empty: {
      slots: {
        root: "sm:p-4 lg:p-4",
      },
    },
  },
});
