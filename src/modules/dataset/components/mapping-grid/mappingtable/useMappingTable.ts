import { useMemo, useState, useEffect } from "react";

import { useReactTable, getCoreRowModel, getExpandedRowModel } from "@tanstack/react-table";

import { type RowItemData } from "./types";
import { computeAutoExpandedRows } from "./utils";

import type { ColumnDef, ExpandedState, Table } from "@tanstack/react-table";

export interface UseMappingTableOptions {
  data: RowItemData[];
  columns: ColumnDef<RowItemData, unknown>[];
  initialExpandAll?: boolean;
}

export interface UseMappingTableResult {
  table: Table<RowItemData>;
}

export const useMappingTable = (opts: UseMappingTableOptions): UseMappingTableResult => {
  const [expanded, setExpanded] = useState<ExpandedState>(() => computeAutoExpandedRows(opts.data));

  useEffect(() => {
    const autoExpanded = computeAutoExpandedRows(opts.data);
    setExpanded(autoExpanded);
  }, [opts.data]);

  const table = useReactTable({
    data: opts.data,
    columns: opts.columns,
    getRowId: (row) => row.id,
    getSubRows: (row) => row.outputs || [],
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onExpandedChange: setExpanded,
    state: {
      expanded,
    },
  });

  return useMemo(() => ({ table }), [table]);
};
