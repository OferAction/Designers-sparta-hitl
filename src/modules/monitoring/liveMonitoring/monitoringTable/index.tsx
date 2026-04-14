import { useMemo, Fragment, useRef, useState } from "react";

import { UseQueryResult } from "@tanstack/react-query";
import { Table } from "@tanstack/react-table";

import { EmptyState } from "./EmptyState";
import { MonitoringNode } from "./types";
import { LiveNodesResponse } from "../../services/types";
import { ApiError } from "@/api/types";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { EvaluationHeader } from "@/modules/evaluation/components/EvaluationHeader";
import { EvaluationTableGroupColumn } from "@/modules/evaluation/components/EvaluationTableGroupColumn";

export default function MonitoringTable({ table, query }: { table: Table<MonitoringNode>; query: UseQueryResult<LiveNodesResponse, ApiError> }) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [globalFilter, setGlobalFilter] = useState("");

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

  const showEmptyState = !query.isLoading && (!query.data || table.getRowModel().rows.length === 0);

  const renderTableContent = () => {
    if (query.error) {
      return <EmptyState message={`Error: ${query.error.message}`} />;
    }

    if (showEmptyState) {
      return <EmptyState message="No workflow data available" />;
    }

    return (
      <ResizablePanelGroup key={panelGroupKey} direction="horizontal" className="overflow-y-auto shrink">
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
                  isLoading={query.isLoading}
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
    );
  };

  return (
    <div className="flex flex-col min-w-0 w-full">
      <EvaluationHeader className="py-3" header="Live Workflow" table={table} filteration={[globalFilter, setGlobalFilter]} />
      <div ref={tableRef} className="overflow-hidden max-w-full flex-1 border-border/40 rounded-md border-2 h-80">
        {renderTableContent()}
      </div>
    </div>
  );
}
