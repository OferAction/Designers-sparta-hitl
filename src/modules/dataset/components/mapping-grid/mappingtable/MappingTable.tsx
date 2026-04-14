import { useMemo } from "react";

import { flexRender } from "@tanstack/react-table";

import { useViewportHeight } from "@/hooks/useViewportHeight";

import { createMappingColumns } from "./columns";
import MappingGridSkeleton from "./MappingGridSkeleton";
import { useMappingTable } from "./useMappingTable";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { NodeItemData } from "./types";

interface MappingTableProps {
  treeData: NodeItemData[];
  isLoading: boolean;
  isEmpty: boolean;
}

const MappingTable = ({ treeData, isLoading, isEmpty }: MappingTableProps) => {
  const columns = useMemo(() => createMappingColumns(), []);
  const { table } = useMappingTable({ data: treeData as NodeItemData[], columns, initialExpandAll: false });
  const viewportHeight = useViewportHeight();

  const visibleRowsCount = table.getRowModel().rows.length;
  const availableHeight = viewportHeight;
  const estimatedRowHeight = 56;
  const minRowsToFillViewport = Math.floor(availableHeight / estimatedRowHeight);
  const placeholderRowsCount = Math.max(0, minRowsToFillViewport - visibleRowsCount - 1);

  return (
    <Table style={{ tableLayout: "fixed", width: "100%" }} wrapperClassName="!overflow-visible" className="min-w-[800px]">
      <TableHeader className="sticky top-0 z-30 bg-background shadow-sm shadow-input">
        <TableRow className="!border-b-0 bg-background">
          {table.getHeaderGroups().map((headerGroup) =>
            headerGroup.headers.map((header) => (
              <TableHead
                key={header.id}
                className="font-medium text-sm text-muted-foreground px-4 overflow-hidden border-r border-muted last:border-0 bg-background sticky top-0 z-30"
              >
                {flexRender(header.column.columnDef.header, header.getContext())}
              </TableHead>
            ))
          )}
        </TableRow>
      </TableHeader>

      <TableBody>
        {isLoading ? (
          <MappingGridSkeleton rows={6} />
        ) : isEmpty ? (
          <TableRow className="hover:bg-transparent">
            <TableCell colSpan={table.getHeaderGroups()[0]?.headers.length} className="text-center py-16 text-muted-foreground">
              <div className="flex flex-col items-center gap-4">
                <div className="text-lg font-medium">No nodes found</div>
                <div className="text-sm max-w-md text-center">
                  Create nodes in the orchestration to see them here. Nodes will appear once you add them to your workflow.
                </div>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          <>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="relative group/row border-b-0">
                {row.getVisibleCells().map((cell) => (
                  <TableCell className="p-0 border-r border-muted last:border-0" key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
            {Array.from({ length: placeholderRowsCount }).map((_, index) => (
              <TableRow key={`placeholder-${index}`} className="pointer-events-none hover:bg-transparent border-b-0">
                {table.getHeaderGroups()[0].headers.map((header) => (
                  <TableCell key={header.id} className="h-12 p-0 border-r border-muted last:border-0">
                    <div className="opacity-0">&nbsp;</div>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </>
        )}
      </TableBody>
    </Table>
  );
};

export default MappingTable;
