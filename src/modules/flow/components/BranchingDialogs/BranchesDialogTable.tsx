import React from "react";

import { SpinnerGapIcon } from "@phosphor-icons/react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { MagnifyingGlassIcon as Search } from "@phosphor-icons/react";

import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type BranchesDialogTableProps<TData extends { id: string }> = {
  columns: ColumnDef<TData>[];
  data?: TData[];
  onRowSelect?: (rowId: TData | null) => void;
  isLoading?: boolean;
};
export function BranchesDialogTable<TData extends { id: string }>({ onRowSelect, columns, data = [], isLoading }: BranchesDialogTableProps<TData>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [isScrolled, setIsScrolled] = React.useState(false);
  const [selectedRowId, setSelectedRowId] = React.useState<string | null>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
  });

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setIsScrolled(container.scrollTop > 0);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center py-4">
        <InputGroup className="!bg-popover border-transparent border-b-border rounded-none !text-popover-foreground !ring-0 w-[300px]">
          <InputGroupInput placeholder="Search..." value={globalFilter ?? ""} onChange={(event) => setGlobalFilter(event.target.value)} />
          <InputGroupAddon>
            <Search />
          </InputGroupAddon>
        </InputGroup>
        {/* <Button className="ml-auto" variant="ghost" size="default">
          <FilterIcon className="w-8 h-6" />
        </Button> */}
      </div>
      {isLoading ? (
        <div className="w-full flex items-center justify-center h-full py-2.5">
          <SpinnerGapIcon className="animate-spin mr-2 inline-block" />
        </div>
      ) : (
        <div className="rounded-lg styled-scrollbar overflow-auto h-full relative border" ref={scrollContainerRef}>
          <Table wrapperClassName="overflow-visible">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className={`h-12 sticky top-0 z-10 transition-colors ${isScrolled ? "bg-muted" : "bg-muted/40"}`}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="px-4" style={{ width: header.getSize() + "px" }}>
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
                    data-state={selectedRowId === row.original.id && "selected"}
                    className="cursor-pointer h-14"
                    onClick={() => {
                      setSelectedRowId(row.original.id);
                      onRowSelect?.(row.original);
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4"
                        style={{
                          width: cell.column.getSize() + "px",
                        }}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
