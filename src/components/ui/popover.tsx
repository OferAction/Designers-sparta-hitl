import * as React from "react";

import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;

interface PopoverContentProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content> {
  /** when true, render content inline instead of inside a Portal */
  disablePortal?: boolean;
  /** optional container for the Portal when disablePortal is false */
  container?: HTMLElement | null;
}

const Content = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, Omit<PopoverContentProps, "disablePortal" | "container">>(
  ({ className, align = "center", sideOffset = 4, ...props }, ref) => {
    return (
      <PopoverPrimitive.Content
        ref={ref}
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
          "data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          "data-[side=bottom]:slide-in-from-top-2",
          "data-[side=left]:slide-in-from-right-2",
          "data-[side=right]:slide-in-from-left-2",
          "data-[side=top]:slide-in-from-bottom-2",
          "origin-[--radix-popover-content-transform-origin]",
          className
        )}
        {...props}
      />
    );
  }
);

const PopoverContent = React.forwardRef<React.ElementRef<typeof PopoverPrimitive.Content>, PopoverContentProps>(
  ({ disablePortal = false, container, ...props }, ref) => {
    return disablePortal ? (
      <Content ref={ref} {...props} />
    ) : (
      <PopoverPrimitive.Portal container={container}>
        <Content ref={ref} {...props} />
      </PopoverPrimitive.Portal>
    );
  }
);
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
