import { flexRender, type Table } from "@tanstack/react-table";

import { Loader } from "@/components/common/Loader";
import { Table as UITable, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/utils";

import type { AccessRequest } from "./types";

interface RequestsDataTableProps {
  table: Table<AccessRequest>;
  isApproveAllPending: boolean;
  showFilters: boolean;
  tableContainerClassName?: string;
  tableClassName?: string;
  headerRowClassName?: string;
  headerCellClassName?: string;
  bodyRowClassName?: string;
  bodyCellClassName?: string;
}

export function RequestsDataTable({
  table,
  isApproveAllPending,
  showFilters,
  tableContainerClassName,
  tableClassName,
  headerRowClassName,
  headerCellClassName,
  bodyRowClassName,
  bodyCellClassName,
}: RequestsDataTableProps) {
  const rows = table.getRowModel().rows;

  return (
    <div className={cn("flex-1 overflow-auto pb-6", tableContainerClassName)}>
      {isApproveAllPending ? (
        <div className="flex items-center justify-center py-12">
          <Loader />
        </div>
      ) : (
        <>
          <UITable className={tableClassName}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className={cn("border-sidebar-border hover:bg-transparent", headerRowClassName)}>
                  {headerGroup.headers.map((header) => {
                    if (!header.column.getIsVisible()) return null;
                    return (
                      <TableHead
                        key={header.id}
                        className={cn(
                          "px-4 py-3 text-sm text-muted-foreground font-medium ",
                          header.column.id === "actions" && "text-right",
                          headerCellClassName
                        )}
                      >
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.id} className={cn("border-sidebar-border", bodyRowClassName)}>
                  {row.getVisibleCells().map((cell) =>
                    bodyCellClassName ? (
                      <td
                        key={cell.id}
                        className={cn(
                          "align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
                          bodyCellClassName,
                          cell.column.id === "actions" && "text-right"
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ) : (
                      <TableCell key={cell.id} className={cn(cell.column.id === "actions" && "text-right", bodyCellClassName)}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    )
                  )}
                </TableRow>
              ))}
            </TableBody>
          </UITable>
          {rows.length === 0 && (
            <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
              {showFilters ? "No requests match your filters" : "No pending requests"}
            </div>
          )}
        </>
      )}
    </div>
  );
}
