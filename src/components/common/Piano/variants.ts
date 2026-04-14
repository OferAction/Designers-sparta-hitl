import { cva, type VariantProps } from "class-variance-authority";

export const pianoIndicatorVariants = cva(["bottom-0 inline-block", "flex-1", "transition-all duration-200", "cursor-pointer", "outline-none"], {
  variants: {
    type: {
      default: ["bg-muted"],
      error: ["bg-destructive"],
      flag: ["bg-warning"],
    },
    state: {
      default: "h-full",
      selected: "h-[calc(100%+2px)] z-20 absolute rounded-md",
    },
  },
  compoundVariants: [
    {
      state: "selected",
      type: "default",
      className: "bg-foreground ring-1 ring-foreground ring-offset-2 ring-offset-background",
    },
    {
      state: "selected",
      type: "error",
      className: "bg-foreground ring-1 ring-destructive ring-offset-2 ring-offset-background",
    },
    {
      state: "selected",
      type: "flag",
      className: "bg-foreground ring-1 ring-warning ring-offset-2 ring-offset-background",
    },
  ],
  defaultVariants: {
    type: "default",
    state: "default",
  },
});

export type PianoIndicatorVariants = VariantProps<typeof pianoIndicatorVariants>;
