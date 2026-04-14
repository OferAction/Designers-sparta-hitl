import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

/** Supported edge directions for pointer-based resizing */
type ResizeEdge = "right" | "bottom" | "bottom-right";

interface ResizablePopoverContentProps extends Omit<React.ComponentPropsWithoutRef<typeof PopoverContent>, "style"> {
  /** Whether the popover is currently open */
  isOpen?: boolean;
  /** Minimum allowed width in pixels */
  minWidth?: number;
  /** Initial width in pixels */
  initialWidth?: number;
  /** Maximum allowed width in pixels */
  maxWidth?: number;
  /** Minimum allowed height in pixels */
  minHeight?: number;
  /** Initial height in pixels */
  initialHeight?: number;
  /** Maximum allowed height in pixels */
  maxHeight?: number;
  /** Additional inline styles for the popover content */
  style?: React.CSSProperties;
}

/** Clamps a value between min and max bounds */
const clamp = (val: number, min: number, max: number): number => Math.min(max, Math.max(min, val));

/**
 * Popover content wrapper with edge-based resizing support.
 * Supports resizing from right edge, bottom edge, and bottom-right corner.
 * Maintains anchor position relative to trigger element.
 */
const ResizablePopoverContent = React.forwardRef<React.ElementRef<typeof PopoverContent>, ResizablePopoverContentProps>(
  (
    {
      isOpen,
      minWidth = 200,
      initialWidth = 300,
      maxWidth = 600,
      minHeight = 150,
      initialHeight = 200,
      maxHeight = 500,
      children,
      className,
      style,
      ...popoverProps
    },
    ref
  ) => {
    const [width, setWidth] = useState(initialWidth);
    const [height, setHeight] = useState(initialHeight);

    const resizeState = useRef<{
      edge: ResizeEdge;
      startX: number;
      startY: number;
      startWidth: number;
      startHeight: number;
    } | null>(null);

    /** Handles pointer movement during active resize operation */
    const handleResizeMove = useCallback(
      (e: PointerEvent) => {
        if (!resizeState.current) return;

        const { edge, startX, startY, startWidth, startHeight } = resizeState.current;

        const isRight = edge === "right" || edge === "bottom-right";
        const isBottom = edge === "bottom" || edge === "bottom-right";

        if (isRight) {
          const deltaX = e.clientX - startX;
          setWidth(clamp(startWidth + deltaX, minWidth, maxWidth));
        }

        if (isBottom) {
          const deltaY = e.clientY - startY;
          setHeight(clamp(startHeight + deltaY, minHeight, maxHeight));
        }
      },
      [minWidth, maxWidth, minHeight, maxHeight]
    );

    /** Cleans up pointer event listeners and resets body styles after resize ends */
    const handleResizeEnd = useCallback(() => {
      resizeState.current = null;
      document.body.style.pointerEvents = "";
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("pointermove", handleResizeMove);
      window.removeEventListener("pointerup", handleResizeEnd);
    }, [handleResizeMove]);

    /** Initiates resize operation on pointer down for the specified edge */
    const handleResizeStart = useCallback(
      (edge: ResizeEdge) => (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();

        resizeState.current = {
          edge,
          startX: e.clientX,
          startY: e.clientY,
          startWidth: width,
          startHeight: height,
        };

        document.body.style.pointerEvents = "none";
        document.body.style.userSelect = "none";
        document.body.style.cursor = getCursorForEdge(edge);

        window.addEventListener("pointermove", handleResizeMove);
        window.addEventListener("pointerup", handleResizeEnd);
      },
      [width, height, handleResizeMove, handleResizeEnd]
    );

    useEffect(() => {
      return () => {
        window.removeEventListener("pointermove", handleResizeMove);
        window.removeEventListener("pointerup", handleResizeEnd);
      };
    }, [handleResizeMove, handleResizeEnd]);

    useEffect(() => {
      if (!isOpen) {
        setWidth(initialWidth);
        setHeight(initialHeight);
      }
    }, [isOpen, initialWidth, initialHeight]);

    return (
      <PopoverContent
        ref={ref}
        className={cn("p-0 relative", className)}
        style={{
          width,
          height,
          minWidth,
          maxWidth,
          minHeight,
          maxHeight,
          overflow: "hidden",
          ...style,
        }}
        {...popoverProps}
      >
        {children}

        <div onPointerDown={handleResizeStart("right")} className="absolute top-0 right-0 w-px h-full cursor-ew-resize transition-colors" />

        <div onPointerDown={handleResizeStart("bottom")} className="absolute bottom-0 left-0 h-px w-full cursor-ns-resize transition-colors" />

        <div
          onPointerDown={handleResizeStart("bottom-right")}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-primary/30 transition-colors z-10"
        />
      </PopoverContent>
    );
  }
);

ResizablePopoverContent.displayName = "ResizablePopoverContent";

/** Maps resize edge to appropriate CSS cursor style */
function getCursorForEdge(edge: ResizeEdge): string {
  switch (edge) {
    case "right":
      return "ew-resize";
    case "bottom":
      return "ns-resize";
    case "bottom-right":
      return "nwse-resize";
  }
}

export { ResizablePopoverContent };
export type { ResizablePopoverContentProps };
