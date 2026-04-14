import { Cell } from "@tanstack/react-table";

import { BadgeCell } from "./BadgeCell";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressCellProps<TData extends { type?: unknown; nodeId?: string; id: string }> {
  value: number | null | undefined;
  cell: Cell<TData, number | null | undefined>;
  showPercent?: boolean;
  gtDiff?: number;
  ProgressclassName?: string;
  indicatorClassName?: string;
}

export const ProgressCell = <TData extends { type?: unknown; nodeId?: string; id: string }>({
  ProgressclassName,
  indicatorClassName,
  value,
  cell,
  showPercent = false,
  gtDiff,
}: ProgressCellProps<TData>) => {
  const isParent = cell.row.depth === 0;

  if (value === null || value === undefined) {
    return null;
  }

  return (
    <div className={cn("flex flex-col items-start gap-0.5 w-[75%]", isParent && "w-full")}>
      <div className="flex items-center gap-1 w-full">
        {showPercent ? `${(value * 100).toFixed(0)}%` : typeof value === "number" ? parseFloat(value.toFixed(3)) : value}
        <BadgeCell className="hover:bg-warning/20 hover:text-warning" value={gtDiff} cell={cell} variant="warning" />
      </div>
      <Progress
        value={value * 100}
        className={cn("h-1 bg-secondary", isParent && "h-1.5 bg-blue-background", ProgressclassName)}
        indicatorClassName={cn("bg-sidebar-foreground", isParent && "bg-blue-accent", indicatorClassName)}
      />
    </div>
  );
};
