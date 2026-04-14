import { useState } from "react";

import {
  type ColumnDef,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import type { AccessRequest, AccessRequestsColumnKey } from "./types";

const COLUMN_IDS: AccessRequestsColumnKey[] = ["name", "roleLabel", "workflow", "requested", "note", "actions",];

export interface UseAccessRequestsTableOptions {
  hiddenColumns?: AccessRequestsColumnKey[];
  initialSorting?: SortingState;
}

export function useAccessRequestsTable(
  data: AccessRequest[],
  columns: ColumnDef<AccessRequest, unknown>[],
  options: UseAccessRequestsTableOptions = {}
) {
  const { hiddenColumns = [], initialSorting = [{ id: "requested", desc: true }] } = options;

  const [sorting, setSorting] = useState<SortingState>(initialSorting);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
    const vis: VisibilityState = {};
    COLUMN_IDS.forEach((key) => {
      vis[key] = !hiddenColumns.includes(key);
    });
    return vis;
  });

  const table = useReactTable({
    data: data,
    columns,
    enableSorting: true,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      if (!filterValue || typeof filterValue !== "string") return true;
      const q = filterValue.toLowerCase();
      const r = row.original;
      return (
        r.userName.toLowerCase().includes(q) ||
        r.entityName.toLowerCase().includes(q) ||
        r.roleLabel.toLowerCase().includes(q) ||
        (r.comment ?? "").toLowerCase().includes(q)
      );
    },
  });

  return table;
}
