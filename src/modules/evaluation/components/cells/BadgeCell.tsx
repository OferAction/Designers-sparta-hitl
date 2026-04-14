import React from "react";

import { Cell } from "@tanstack/react-table";
import { cva, type VariantProps } from "class-variance-authority";
import { useNavigate, useSearchParams } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { isMetric } from "@/modules/evaluation/types";

const badgeCellVariants = cva("rounded-md py-0.5 text-xs cursor-pointer", {
  variants: {
    variant: {
      secondary: "bg-accent/50",
      destructive: "hover:bg-destructive hover:text-background",
      warning: "hover:bg-warning hover:text-background",
    },
  },
  defaultVariants: {
    variant: "secondary",
  },
});

interface BadgeCellProps<TData extends { type?: unknown; nodeId?: string; id: string }> extends VariantProps<typeof badgeCellVariants> {
  value: number | string | null | undefined;
  cell: Cell<TData, unknown>;
  showPercent?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const BadgeCell = <TData extends { type?: unknown; nodeId?: string; id: string }>({
  children,
  className,
  value,
  cell,
  variant = "secondary",
  showPercent = false,
}: BadgeCellProps<TData>) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isNode = !!cell.row.original.type;

  if (value === null || value === undefined || !value) return null;

  const navigateToBottleneckAnalysis = () => {
    const { batchId, configId } = (cell.getContext().table.options.meta || {}) as { batchId: string; configId: string };
    const cellValue = cell.getContext().getValue();
    if (!value) return;

    // Extract resultPath from cellValue if it's an object with resultPath property
    const resultPath =
      typeof cellValue === "object" && cellValue !== null && "resultPath" in cellValue
        ? (cellValue as { resultPath?: string }).resultPath
        : undefined;

    const propertyPath = resultPath ?? cell.row.original.nodeId ?? buildPath(cell.row) ?? "";

    const columnId = cell.column.id;
    let url: string;
    if (batchId && configId) {
      url = `${batchId}/version/${configId}/property/${propertyPath}/metric`;
    } else {
      url = `property/${propertyPath}/metric`;
    }
    if (isMetric(cellValue)) {
      url += `/gtDiff`;
      url += `/${cellValue.name}`; // Accuracy, F1Score, etc.
    } else {
      url += `/${columnId}`; // samples, tokens, time, etc.
    }

    const searchString = searchParams.toString();
    const fullUrl = searchString ? `${url}?${searchString}` : url;

    navigate(fullUrl, {
      state: { nonce: value },
    });
  };

  const renderValue = () => {
    if (showPercent) {
      if (typeof value === "number") {
        const fixedValue = parseFloat((value * 100).toFixed(1));
        if (fixedValue === 0) return "0";
        return `${fixedValue}%`;
      }
      return value;
    }
    return value;
  };

  return (
    <Badge
      variant={variant}
      className={cn("px-1.5 py-0.5", badgeCellVariants({ variant }), !isNode && "bg-transparent", className)}
      onClick={navigateToBottleneckAnalysis}
    >
      <div className="flex items-center gap-1">
        {children}
        {renderValue()}
      </div>
    </Badge>
  );
};

const buildPath = <TData extends { id: string }>(row: Cell<TData, unknown>["row"]) => {
  const path: string[] = [row.original.id];
  let currentRow = row.getParentRow();

  while (currentRow) {
    path.unshift(currentRow.original.id);
    currentRow = currentRow.getParentRow();
  }

  return path.join("-");
};
