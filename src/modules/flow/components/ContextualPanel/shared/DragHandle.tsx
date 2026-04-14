import React from "react";

import { VectorIcon } from "@/lib/icons";
import { cn } from "@/utils";

export interface DragHandleProps extends React.HTMLAttributes<HTMLSpanElement> {
  isDragging?: boolean;
  hiddenUntilHover?: boolean;
}

export const DragHandle: React.FC<DragHandleProps> = ({ className, isDragging, hiddenUntilHover = true, ...rest }) => {
  return (
    <span
      data-drag-handle
      role="button"
      aria-label="Reorder rule"
      tabIndex={0}
      className={cn(
        "inline-flex items-center justify-center hover:cursor-grab size-5 text-primary transition select-none cursor-grab active:cursor-grabbing",
        hiddenUntilHover && "opacity-0 group-hover/item:opacity-100",
        isDragging && "opacity-100 text-primary",
        className
      )}
      {...rest}
    >
      <VectorIcon className="size-3 pointer-events-none" />
    </span>
  );
};

export default DragHandle;
