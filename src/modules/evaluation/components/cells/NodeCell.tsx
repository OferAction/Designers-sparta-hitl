import { DotIcon, CaretDownIcon as ChevronDown, CaretRightIcon as ChevronRight } from "@phosphor-icons/react";
import { Cell } from "@tanstack/react-table";

import { NodeIconsMapping } from "@/constants";
import { cn } from "@/lib/utils";

interface NodeCellProps<TData extends { type?: keyof typeof NodeIconsMapping | "agent"; agentKey?: string }> {
  cell: Cell<TData, string>;
  value: string;
  globalFilter?: string;
  className?: string;
}

// Helper function to highlight matching text
const highlightText = (text: string, query: string) => {
  if (!query || !text) return <span>{text}</span>;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return <span>{text}</span>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + query.length);
  const after = text.slice(index + query.length);

  return (
    <>
      {before}
      <span className="text-foreground font-semibold">{match}</span>
      {after}
    </>
  );
};

export const NodeCell = <TData extends { type?: keyof typeof NodeIconsMapping | "agent"; agentKey?: string }>({
  cell,
  value,
  globalFilter,
  className,
}: NodeCellProps<TData>) => {
  const row = cell.row;
  const nodeType = row.original.type === "agent" ? (row.original.agentKey as keyof typeof NodeIconsMapping) : row.original.type;
  const Icon = nodeType && NodeIconsMapping[nodeType];
  return (
    <div
      className={cn("flex items-center relative text-sm cursor-pointer flex-1 min-w-0")}
      style={{
        paddingLeft: row.depth > 0 ? `${row.depth * 16}px` : undefined,
      }}
      onClick={row.getToggleExpandedHandler()}
    >
      {row.depth === 0 ? (
        <div className={cn("flex items-center justify-center p-0 rounded-sm transition-colors", !row.getCanExpand() && "invisible")}>
          {row.getIsExpanded() ? <ChevronDown className="size-2" /> : <ChevronRight className="size-2" />}
        </div>
      ) : (
        <div className="w-[1px] h-[36px] bg-border mr-2" />
      )}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        {Icon ? (
          <div className="p-0 size-5 rounded bg-accent/50 flex items-center justify-center">
            <Icon className="text-muted-foreground group-hover:text-foreground size-4" />
          </div>
        ) : (
          <DotIcon className="size-4 text-border mr-0.5" />
        )}
        <span className={cn("truncate max-w-full", className)}>{highlightText(String(value), globalFilter || "")}</span>
      </div>
    </div>
  );
};
