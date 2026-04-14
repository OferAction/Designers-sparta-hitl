import React from "react";

import { Table } from "@tanstack/react-table";

import { ColumnVisibilityPopover } from "./ColumnVisibilityPopover";
import { Input } from "@/components/ui/input";

import { cn } from "@/utils/tw-clsx";

interface EvaluationHeaderProps<TData = any> {
  filteration: [globalFilter: string, setGlobalFilter: React.Dispatch<React.SetStateAction<string>>];
  header?: string;
  table?: Table<TData>;
  children?: React.ReactNode;
  className?: string;
}

export function EvaluationHeader<TData = any>({
  header,
  filteration: [globalFilter, setGlobalFilter],
  table,
  children,
  className,
}: EvaluationHeaderProps<TData>) {
  return (
    <div className={cn("flex justify-between items-center pt-6 pb-2 ofer", className)}>
      <div className="flex items-center gap-6">
        <h1 className="text-base">{header}</h1>
        {children}
      </div>

      <div className="flex gap-2 items-center">
        <Input
          placeholder="Search node or output..."
          className="max-w-60 h-9"
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
        {table && <ColumnVisibilityPopover table={table} />}
      </div>
    </div>
  );
}
