import { useEffect, useMemo, useState } from "react";

import { useReactTable, getCoreRowModel, getExpandedRowModel } from "@tanstack/react-table";

import { computeAutoExpandedRows } from "./utils";

import type { RowItemData } from "./types";
import type { ColumnDef, ExpandedState, Table } from "@tanstack/react-table";

export interface UseStartNodeTableOptions {
  data: RowItemData[];
  columns: ColumnDef<RowItemData, unknown>[];
}

export interface UseStartNodeTableResult {
  table: Table<RowItemData>;
}

export const useStartNodeTable = (opts: UseStartNodeTableOptions): UseStartNodeTableResult => {
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
