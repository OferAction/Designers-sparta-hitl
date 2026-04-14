import React, { useCallback, MouseEvent } from "react";

import { TrashIcon } from "@phosphor-icons/react";
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

const iconVariants = cva("h-4 w-4 cursor-pointer text-primary hover:text-destructive");

interface DeleteButtonProps extends React.HTMLAttributes<SVGSVGElement> {
  className?: string;
  onDelete?: () => void;
  disabled?: boolean;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({ className, onDelete, disabled, ...props }) => {
  const handleDelete = useCallback(
    (e: MouseEvent<SVGSVGElement>) => {
      e.stopPropagation();
      e.preventDefault();

      if (disabled) return;
      if (onDelete) {
        onDelete();
      }
    },
    [onDelete, disabled]
  );

  return (
    <TrashIcon
      className={cn(iconVariants(), disabled && "opacity-50 cursor-not-allowed", className)}
      onClick={handleDelete}
      aria-disabled={disabled}
      {...props}
    />
  );
};
