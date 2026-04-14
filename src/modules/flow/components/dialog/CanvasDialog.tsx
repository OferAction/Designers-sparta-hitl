import { ReactNode, useEffect, useState } from "react";

import { DialogTitle } from "@radix-ui/react-dialog";

import { useCanvasDialogContext, useCanvasDialogStateContext } from "./CanvasDialogContext";
import { Dialog, DialogContent, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/utils";

interface CanvasDialogProps {
  content?: ReactNode;
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export function CanvasDialog({ content: propContent, className = "", onOpenChange }: CanvasDialogProps) {
  const { containerRef, content: contextContent } = useCanvasDialogStateContext();
  const { isOpen, closeDialog } = useCanvasDialogContext();
  const [style, setStyle] = useState<React.CSSProperties>({});

  const displayContent = propContent || contextContent;

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      closeDialog();
    }
    onOpenChange?.(open);
  };

  useEffect(() => {
    if (!containerRef?.current) return;

    const observer = new ResizeObserver(() => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const horizontalMarginRatio = 0.07;
      const verticalMarginRatio = 0.15;
      const horizontalMargin = rect.width * horizontalMarginRatio;
      const verticalMargin = rect.height * verticalMarginRatio;
      setStyle({
        left: `${rect.left + horizontalMargin}px`,
        right: `${window.innerWidth - (rect.right - horizontalMargin)}px`,
        top: `${rect.top + verticalMargin}px`,
        bottom: `${window.innerHeight - (rect.bottom - verticalMargin)}px`,
        height: `${rect.height - verticalMargin * 2}px`,
        width: `${rect.width - horizontalMargin * 2}px`,
        margin: 0,
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [containerRef]);
  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTitle className="hidden">Contextual Panel Dialog</DialogTitle>
      <DialogContent
        className={cn(
          "border-border bg-background block translate-x-0 translate-y-0 origin-center !max-w-[unset] !max-h-[unset]",
          "data-[state=closed]:!slide-out-to-right-0 data-[state=closed]:!slide-out-to-top-0 data-[state=open]:!slide-in-from-left-0 data-[state=open]:!slide-in-from-top-0 data-[state=closed]:!zoom-out-100 data-[state=open]:!zoom-in-100 data-[state=closed]:z-[5] !duration-200",
          className
        )}
        style={style}
        hideCloseButton={true}
        overlayProps={{ className: "hidden" }}
        onContextMenu={(e) => {
          e.stopPropagation();
        }}
      >
        <DialogDescription className="sr-only">Contextual Panel Dialog</DialogDescription>
        {displayContent}
      </DialogContent>
    </Dialog>
  );
}
