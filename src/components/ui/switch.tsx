import * as React from "react";

import * as SwitchPrimitives from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

type SwitchSize = "default" | "sm" | "xs";

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  size?: SwitchSize;
  thumbClassName?: string;
}

const sizeStyles: Record<SwitchSize, { root: string; thumb: string; thumbTranslate: string }> = {
  default: {
    root: "h-5 w-9",
    thumb: "h-4 w-4",
    thumbTranslate: "data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-4",
  },
  sm: {
    root: "h-4 w-6 p-0.5",
    thumb: "h-3 w-3",
    thumbTranslate: "data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-[calc(100%-6px)]",
  },
  xs: {
    root: "h-3.5 w-6",
    thumb: "h-2.5 w-2.5",
    thumbTranslate: "data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-3",
  },
};

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  ({ className, thumbClassName, children, size = "default", ...props }, ref) => {
    const s = sizeStyles[size];
    return (
      <SwitchPrimitives.Root
        className={cn(
          "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
          s.root,
          "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted",
          size === "xs" && "focus-visible:ring-1",
          className
        )}
        {...props}
        ref={ref}
      >
        <SwitchPrimitives.Thumb
          className={cn(
            "pointer-events-none block rounded-full shadow-sm ring-0 transition-transform data-[state=unchecked]:bg-foreground data-[state=checked]:bg-background",
            s.thumb,
            s.thumbTranslate,
            thumbClassName
          )}
        >
          {children}
        </SwitchPrimitives.Thumb>
      </SwitchPrimitives.Root>
    );
  }
);
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
