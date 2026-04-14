import * as React from "react";

import { UseQueryResult } from "@tanstack/react-query";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";

import { columns } from "./columns";
import { ActivitiesResponse } from "../../services/types";
import { ApiError } from "@/api";
import { EvaluationTableGroupColumn } from "@/modules/evaluation/components/EvaluationTableGroupColumn";

const emptyArray: never[] = [];

export default function ActivityLogTable({ query: { isLoading, data } }: { query: UseQueryResult<ActivitiesResponse, ApiError> }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const tableRef = React.useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data: data?.activities || emptyArray,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const groupedHeaders = table.getHeaderGroups();

  return (
    <div className="flex flex-col min-w-0 grow ">
      <div className="flex justify-between items-center py-3 h-[60px]">
        <h1 className="text-base">Live Activity</h1>

        {/* <div className="flex gap-2 items-center">{table && <ColumnVisibilityPopover table={table} />}</div> */}
      </div>
      {
        <div ref={tableRef} className="overflow-hidden flex-1 border-border/40 rounded-md border-2">
          <div className="overflow-y-auto shrink h-full">
            {data?.activities && data.activities.length > 0 ? (
              groupedHeaders.map((group, groupIndex) => {
                return (
                  <React.Fragment key={groupIndex}>
                    <div className="h-full">
                      <EvaluationTableGroupColumn
                        groupId={group.id}
                        groupIndex={groupIndex}
                        totalGroups={groupedHeaders.length}
                        headers={group.headers}
                        rows={table.getRowModel().rows}
                        isLoading={isLoading}
                        tableRef={tableRef}
                      />
                    </div>
                  </React.Fragment>
                );
              })
            ) : (
              <div className="flex justify-center items-center h-full text-muted-foreground"> No Live Activity Data available </div>
            )}
          </div>
        </div>
      }
    </div>
  );
}
