import { useEffect, useRef, useState } from "react";

import { useLeftPanelWidth } from "@/hooks/useLeftPanelWidth";

import { usePanelDialogStateContext } from "./PanelDialogContext";
import { DialogContent, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/utils";

export type PanelDialogPosition = "top" | "none"; // "top" aligns with container top; "none" leaves vertical positioning to classes

type ResizableConfig = {
  enabled?: boolean;
  directions?: Array<"top" | "right" | "bottom" | "left">;
  defaultSize?: { width?: number | string; height?: number | string };
  minSizeFitsContent?: boolean;
  maxWidth?: number | string;
  maxHeight?: number | string;
  minWidth?: number;
  minHeight?: number;
};

export const PanelDialogWrapper = ({
  className,
  children,
  position = "top",
  rightOffset = 12,
  resizable,
  observeLeftPanel = false,
}: {
  className?: string;
  children: React.ReactNode;
  position?: PanelDialogPosition;
  rightOffset?: number;
  resizable?: ResizableConfig;
  observeLeftPanel?: boolean;
}) => {
  const { containerRef } = usePanelDialogStateContext();
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [rightPanelWidth, setRightPanelWidth] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const leftPanelWidth = useLeftPanelWidth();
  const initialTopRef = useRef<number>(160);

  useEffect(() => {
    if (!containerRef?.current) return;

    const computeAndSet = () => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setRightPanelWidth(rect.width);
      const next: React.CSSProperties = {
        right: `${rect.width + rightOffset}px`,
        top: position === "top" ? rect.top : 160,
      };

      setStyle(next);

      const topValue = typeof next.top === "number" ? next.top : parseFloat(String(next.top));
      if (!Number.isNaN(topValue)) {
        initialTopRef.current = topValue;
      }
    };

    const observer = new ResizeObserver(computeAndSet);
    observer.observe(containerRef.current);
    computeAndSet();
    return () => observer.disconnect();
  }, [containerRef, position, rightOffset]);

  const handleResizeWithDirection = (dir: "top" | "right" | "bottom" | "left" | "topRight" | "bottomRight" | "bottomLeft" | "topLeft") => {
    if (dir.includes("top")) {
      setStyle((prevStyle) => ({
        ...prevStyle,
        top: initialTopRef.current,
      }));
    }
  };

  return (
    <DialogContent
      style={style}
      className={cn(
        "border-border block bg-ocr-modal-bg/30 backdrop-blur-[9px] left-auto translate-x-0 translate-y-0 origin-center",
        "animate-spring-in",
        className
      )}
      ref={contentRef}
      hideCloseButton={true}
      overlayProps={{ className: "bg-transparent" }}
      resizable={
        resizable && observeLeftPanel
          ? {
              ...resizable,
              maxWidth: window.innerWidth - leftPanelWidth - rightOffset * 2 - rightPanelWidth,
            }
          : resizable
      }
      onResizeWithDirection={resizable?.enabled ? handleResizeWithDirection : undefined}
    >
      <DialogDescription className="sr-only">Contextual Panel Dialog</DialogDescription>
      {children}
    </DialogContent>
  );
};
