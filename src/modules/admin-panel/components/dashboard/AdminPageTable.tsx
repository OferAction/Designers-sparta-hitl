import { ColumnDef, FilterFn, flexRender, getCoreRowModel, getFilteredRowModel, getSortedRowModel, useReactTable } from "@tanstack/react-table";

import { Loader } from "@/components/common/Loader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/utils";

interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  className?: string;
  wrapperClassName?: string;
  tableHeaderClassName?: string;
  tableRowHeaderClassName?: string;
  tableRowClassName?: string;
  tableCellClassName?: string;
  isLoading?: boolean;
  LoadingMessage?: string;
  NoResultMessage?: string;
  globalFilter?: string;
  globalFilterFn?: FilterFn<TData>;
  onRowClick?: (row: TData) => void;
}

/** Reusable generic table component powered by TanStack React Table */
export const AdminPageTable = <TData,>({
  columns,
  data,
  className,
  tableHeaderClassName = "bg-background sticky top-0 z-10",
  tableRowHeaderClassName = "border-sidebar-border hover:bg-transparent",
  tableRowClassName = "border-sidebar-border",
  tableCellClassName = "py-4",
  isLoading = false,
  NoResultMessage = "No results found.",
  globalFilter,
  globalFilterFn,
  wrapperClassName,
  onRowClick,
}: DataTableProps<TData>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    enableSorting: true,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    globalFilterFn,
  });
  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center py-12 h-full">
          <Loader />
        </div>
      ) : (
        <Table className={className} wrapperClassName={wrapperClassName}>
          <TableHeader className={tableHeaderClassName}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow className={tableRowHeaderClassName} key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={cn(tableRowClassName, onRowClick && "cursor-pointer")}
                  onClick={() => onRowClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={tableCellClassName}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">{NoResultMessage}</div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </>
  );
};

export default AdminPageTable;
