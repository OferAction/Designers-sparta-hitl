import { useMemo, Fragment, useRef } from "react";

import { Table } from "@tanstack/react-table";

import { useGetEvaluation } from "../services";
import { EvaluationNode } from "./types";
import { EvaluationTableGroupColumn } from "../components/EvaluationTableGroupColumn";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export default function ReliableTable({ batchId, globalFilter, table }: { batchId?: string; globalFilter: string; table: Table<EvaluationNode> }) {
  const { data, isLoading, error } = useGetEvaluation(batchId || "");
  const tableRef = useRef<HTMLDivElement>(null);

  const groupedHeaders = useMemo(() => {
    const headerGroups = table.getHeaderGroups();
    const leafHeaders = headerGroups[headerGroups.length - 1]?.headers || [];

    // Group leaf headers by their parent column
    const grouped = new Map<string, typeof leafHeaders>();

    leafHeaders.forEach((header) => {
      if (!header.column.getIsVisible()) return;

      const parentId = header.column.parent?.id || `ungrouped-${header.id}`;
      if (!grouped.has(parentId)) {
        grouped.set(parentId, []);
      }
      grouped.get(parentId)!.push(header);
    });

    return Array.from(grouped.entries()).map(([parentId, headers]) => {
      const parentColumn = headers[0]?.column.parent;
      const defaultSize = (parentColumn?.columnDef?.meta as { defaultSize: number })?.defaultSize || 25;

      return {
        groupId: parentId,
        headers,
        defaultSizePercent: defaultSize,
      };
    });
  }, [table]);

  const panelGroupKey = useMemo(() => {
    return groupedHeaders.map((g) => g.groupId).join("-");
  }, [groupedHeaders]);

  if (error) {
    return <div className="w-full p-4 text-center text-destructive">Error loading evaluation data: {(error as Error).message}</div>;
  }

  if (!isLoading && (!data || !table.getRowModel().rows.length)) {
    return <div className="w-full p-4 text-center text-muted-foreground">No evaluation data available</div>;
  }

  return (
    <div className="overflow-hidden max-w-full flex-1 border-border/40 rounded-md border-2 h-80" ref={tableRef}>
      <ResizablePanelGroup key={panelGroupKey} direction="horizontal" className="overflow-y-auto">
        {groupedHeaders.map((group, groupIndex) => {
          const groupId = group.groupId || `ungrouped-${groupIndex}`;

          return (
            <Fragment key={groupId}>
              <ResizablePanel defaultSize={group.defaultSizePercent} minSize={15} className="h-full">
                <EvaluationTableGroupColumn
                  groupId={groupId}
                  groupIndex={groupIndex}
                  totalGroups={groupedHeaders.length}
                  headers={group.headers}
                  rows={table.getRowModel().rows}
                  globalFilter={globalFilter}
                  isLoading={isLoading}
                  tableRef={tableRef}
                />
              </ResizablePanel>
              {groupIndex < groupedHeaders.length - 1 && (
                <ResizableHandle className="bg-border/40 w-0.5 hover:bg-foreground data-[resize-handle-state=drag]:bg-muted-foreground transition-colors" />
              )}
            </Fragment>
          );
        })}
      </ResizablePanelGroup>
    </div>
  );
}
