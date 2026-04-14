import React, { FC, useCallback, useEffect, useState } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils";

interface MousePosition {
  x: number;
  y: number;
}

interface UseMouseOptions {
  resetOnExit?: boolean;
}

export function useMouse<T extends HTMLElement = HTMLElement>(options: UseMouseOptions = {}) {
  const { resetOnExit = false } = options;
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });
  const [element, setElement] = useState<T | null>(null);

  // Callback ref to capture the element (if provided)
  const ref = useCallback((node: T | null) => {
    setElement(node);
  }, []);

  // Handle mouse movement using native DOM Event
  const handleMouseMove = useCallback(
    (event: Event) => {
      const mouseEvent = event as MouseEvent;
      if (element) {
        const rect = element.getBoundingClientRect();
        // Calculate coordinates relative to the element
        const x = Math.max(0, Math.round(mouseEvent.clientX - rect.left));
        const y = Math.max(0, Math.round(mouseEvent.clientY - rect.top));
        setPosition({ x, y });
      } else {
        // Fallback: use client coordinates when no element is provided
        setPosition({ x: mouseEvent.clientX, y: mouseEvent.clientY });
      }
    },
    [element]
  );

  // Optionally reset mouse position on leaving the element
  const handleMouseLeave = useCallback(() => {
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    // If no element is provided, default to document for global tracking
    const target: HTMLElement | Document = element || document;
    target.addEventListener("mousemove", handleMouseMove);
    if (resetOnExit) {
      target.addEventListener("mouseleave", handleMouseLeave);
    }
    return () => {
      target.removeEventListener("mousemove", handleMouseMove);
      if (resetOnExit) {
        target.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [element, handleMouseMove, handleMouseLeave, resetOnExit]);

  return { ref, ...position };
}

type Props = React.ComponentPropsWithoutRef<typeof Tooltip> & {
  children: React.ReactElement;
  tooltip: React.ReactNode;
  withProvider?: boolean;
  contentClassName?: string;
  disableTooltip?: boolean;
  side?: "top" | "right" | "bottom" | "left";
  align?: "center" | "end" | "start";
  followCursor?: boolean;
};

const WithTooltip: FC<Props> = ({
  followCursor,
  children,
  tooltip,
  disableTooltip = false,
  contentClassName,
  withProvider = true,
  delayDuration = 0,
  side,
  align,
  ...rest
}) => {
  const { ref, x, y } = useMouse<HTMLElement>();
  const triggerProps: Partial<React.ComponentPropsWithoutRef<typeof TooltipContent>> = {};
  if (followCursor) {
    triggerProps.align = "start";
    triggerProps.alignOffset = x - 10;
    triggerProps.sideOffset = -y + 10;
  }

  const content = (
    <Tooltip delayDuration={delayDuration} {...rest}>
      <TooltipTrigger ref={ref} asChild>
        {children}
      </TooltipTrigger>
      {!disableTooltip && (
        <TooltipContent
          {...triggerProps}
          side={side}
          align={align}
          className={cn("bg-popover text-popover-foreground rounded-md border border-border", contentClassName)}
        >
          {typeof tooltip === "string" ? <p className="text-xs leading-4 whitespace-pre-wrap break-words">{tooltip}</p> : tooltip}
        </TooltipContent>
      )}
    </Tooltip>
  );

  if (withProvider) {
    return <TooltipProvider>{content}</TooltipProvider>;
  }
  return content;
};
export default WithTooltip;
