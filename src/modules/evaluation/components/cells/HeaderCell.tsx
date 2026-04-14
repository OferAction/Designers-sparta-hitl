import { InfoIcon } from "@phosphor-icons/react";
import { Header } from "@tanstack/react-table";

import { SortDescIcon as ArrowUp, SortAscIcon as ArrowDown } from "@/lib/icons";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/utils";

interface HeaderCellProps {
  title: string;
  subtitle?: string | number;
  showSort?: boolean;
  tooltip?: string;
  header?: Header<any, unknown>;
}

export const HeaderCell = ({ title, subtitle, tooltip, showSort = false, header }: HeaderCellProps) => {
  const isSorted = header?.column.getIsSorted() || false;
  const canSort = header?.column.getCanSort() || showSort;
  return (
    <div className="flex gap-1 group/header">
      <div className="text-sidebar-foreground/70 text-left">
        <div className="flex gap-1">
          <h2 className="text-sm font-semibold leading-6">{title}</h2>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="size-3" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {canSort && (
            <span className="flex items-center group-hover/header:opacity-100 opacity-0">
              <ArrowUp className={cn(" h-4", isSorted === "asc" ? "text-foreground" : "opacity-30")} />
              <ArrowDown className={cn("h-4", isSorted === "desc" ? "text-foreground" : "opacity-30")} />
            </span>
          )}
        </div>
        <p className="text-xs">{subtitle}</p>
      </div>
    </div>
  );
};
