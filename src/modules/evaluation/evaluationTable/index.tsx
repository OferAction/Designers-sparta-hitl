import { Fragment, useMemo, useRef, useState } from "react";

import { useParams } from "react-router-dom";

import { createColumns } from "./columns";
import { useEvaluationTable } from "./useEvaluationTable";
import EvaluationEmptyState from "../components/EvaluationEmptyState";
import { EvaluationHeader } from "../components/EvaluationHeader";
import { EvaluationTableGroupColumn } from "../components/EvaluationTableGroupColumn";
import { useGetEvaluation, useGetEvaluationHistory } from "../services";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

export default function EvaluationTable({ batchId }: { batchId?: string }) {
  const { data, isLoading } = useGetEvaluation(batchId || "");
  const { fileId = "" } = useParams();
  const { data: historyData, isFetched, isLoading: isHistoryLoading } = useGetEvaluationHistory(fileId);
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const tableRef = useRef<HTMLDivElement>(null);

  const columns = useMemo(() => createColumns(data), [data]);
  const table = useEvaluationTable(data, columns, {
    configId: data?.configurationId,
    batchId,
  });

  const groupedHeaders = useMemo(() => {
    const headerGroups = table.getHeaderGroups();
    const leafHeaders = headerGroups[headerGroups.length - 1]?.headers || [];

    // Group leaf headers by their parent column using Map for better performance
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

  if (!historyData?.pages.length && isFetched) {
    return <EvaluationEmptyState />;
  }

  return (
    <div className="w-full flex flex-col flex-1 pb-2">
      <EvaluationHeader header="Workflow Evaluation" filteration={[globalFilter, setGlobalFilter]} table={table} />
      <div className="overflow-hidden max-w-full w-full flex-1" ref={tableRef}>
        <ResizablePanelGroup direction="horizontal" className="overflow-y-auto" key={panelGroupKey}>
          {groupedHeaders.map((group, groupIndex) => {
            const groupId = group.groupId || `ungrouped-${groupIndex}`;
            return (
              <Fragment key={groupId}>
                <ResizablePanel defaultSize={group.defaultSizePercent} minSize={15}>
                  <EvaluationTableGroupColumn
                    className="border-t-2 border-l-2 border-r-2 border-b-2 "
                    groupId={groupId}
                    groupIndex={groupIndex}
                    totalGroups={groupedHeaders.length}
                    headers={group.headers}
                    rows={table.getRowModel().rows}
                    globalFilter={globalFilter}
                    isLoading={isLoading || isHistoryLoading}
                    tableRef={tableRef}
                  />
                </ResizablePanel>
                {groupIndex < groupedHeaders.length - 1 && (
                  <ResizableHandle className="w-px mx-1 bg-transparent hover:bg-foreground data-[resize-handle-state=drag]:bg-muted-foreground transition-colors my-2" />
                )}
              </Fragment>
            );
          })}
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
