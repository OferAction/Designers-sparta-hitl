import { memo, useMemo } from "react";

import { CaretDownIcon, CaretRightIcon } from "@phosphor-icons/react";
import { flexRender } from "@tanstack/react-table";

import { createStartColumns } from "./startColumns";
import { useStartNodeTable } from "./useStartNodeTable";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/utils";

import type { NodeItemData } from "./types";

interface StartNodeSectionProps {
  node: NodeItemData;
}

const StartNodeSection = ({ node }: StartNodeSectionProps) => {
  const columns = useMemo(() => createStartColumns(), []);

  const data = useMemo(() => [node], [node]);

  const { table } = useStartNodeTable({ data, columns });

  const Icon = node.icon;

  const rows = table.getRowModel().rows;
  const headerRow = rows[0];
  const isExpanded = headerRow?.getIsExpanded() ?? false;
  const canExpand = !!node.outputs?.length;

  const outputRows = rows.filter((row) => row.depth > 0);

  return (
    <div className="border-t border-t-input bg-background">
      <Table style={{ tableLayout: "fixed", width: "100%" }}>
        <TableBody>
          <TableRow className="border-b-0 hover:bg-muted/50">
            <TableCell className="px-0 border-r border-muted">
              <div className="w-full relative min-w-0">
                <div
                  className={cn("flex items-center gap-2 py-2 min-w-0 px-6", canExpand && "cursor-pointer")}
                  onClick={() => headerRow.toggleExpanded()}
                >
                  <div className="w-3 h-4 flex items-center justify-center flex-shrink-0">
                    {canExpand ? isExpanded ? <CaretDownIcon size={14} /> : <CaretRightIcon size={14} /> : <div className="w-3 h-4" />}
                  </div>
                  <Icon size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-sm text-foreground truncate">{node.title}</span>
                  </div>
                </div>
              </div>
            </TableCell>
            {table
              .getHeaderGroups()[0]
              ?.headers.slice(1)
              .map((header, index, headers) => (
                <TableCell
                  key={header.id}
                  className={cn(
                    "align-top pt-4 px-4 text-sm text-muted-foreground font-medium",
                    index < headers.length - 2 ? "border-r border-muted" : ""
                  )}
                >
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </TableCell>
              ))}
          </TableRow>

          {isExpanded &&
            outputRows.map((row) => (
              <TableRow key={row.id} className="border-b-0 hover:bg-muted/30 relative group/row">
                {row.getVisibleCells().map((cell, index, cells) => (
                  <TableCell className={cn("p-0", index < cells.length - 2 ? "border-r border-muted" : "")} key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default memo(StartNodeSection);
