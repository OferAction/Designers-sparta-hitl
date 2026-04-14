import { getActualNodeId } from "../utils";
import EvaluationFunctionsCell from "./cells/EvaluationFunctionsCell";
import MatchedLabelsCell from "./cells/MatchedLabelsCell";
import MetricsCell from "./cells/MetricsCell";
import NodeColumnCell from "./cells/NodeColumnCell";
import NodeHeaderCell from "./cells/NodeHeaderCell";
import { isOutputRow, type NodeItemData, type NodeOutputRowData, type RowItemData } from "./types";
import { NodeInputOutputType } from "@/modules/flow/types/BaseNodeTypes";
import { useFlowStore } from "@/store";

import type { CellContext, ColumnDef } from "@tanstack/react-table";

function MatchedLabelsCellWithAlignment({
  parent,
  output,
  isStartSection,
  ctx,
}: {
  parent: NodeItemData;
  output: NodeOutputRowData;
  isStartSection: boolean;
  ctx: CellContext<RowItemData, unknown>;
}) {
  const alignmentKeys = useFlowStore((state) => state.alignmentKeys);
  const actualNodeId = getActualNodeId(ctx.row, output, parent.id);
  const entry = alignmentKeys.find((k) => k.nodeId === actualNodeId);
  const alignmentKeyPath = entry?.outputId || null;
  return (
    <MatchedLabelsCell
      nodeId={actualNodeId}
      outputId={output.id}
      isStartNode={isStartSection}
      expectedType={output?.type}
      alignmentKeyFilterPath={alignmentKeyPath}
    />
  );
}

export const createMappingColumns = (isStartSection: boolean = false): ColumnDef<RowItemData, unknown>[] => [
  {
    id: "node",
    header: () => <div className="flex items-center gap-2 truncate text-sm font-medium text-muted-foreground">Nodes data</div>,
    accessorFn: () => undefined,
    cell: (ctx: CellContext<RowItemData, unknown>) => {
      const data = ctx.row.original;
      if (isOutputRow(data)) {
        const parent = ctx.row.getParentRow()?.original as NodeItemData | undefined;
        if (!parent) return null;
        const actualNodeId = getActualNodeId(ctx.row, data, parent.id);

        return <NodeColumnCell node={parent} output={data} isStartNode={isStartSection} level={ctx.row.depth} actualNodeId={actualNodeId} />;
      }
      return (
        <NodeHeaderCell
          node={data}
          level={ctx.row.depth}
          canExpand={ctx.row.getCanExpand()}
          isExpanded={ctx.row.getIsExpanded()}
          setExpanded={ctx.row.toggleExpanded}
        />
      );
    },
    size: 304,
    minSize: 150,
    maxSize: 500,
  },
  {
    id: "matchedLabels",
    header: () => <span className="truncate text-sm font-medium text-muted-foreground">Matched labels</span>,
    accessorFn: () => undefined,
    cell: (ctx: CellContext<RowItemData, unknown>) => {
      const data = ctx.row.original;
      if (!isOutputRow(data)) return null;
      const parent = ctx.row.getParentRow()?.original as NodeItemData | undefined;
      if (!parent) return null;
      return <MatchedLabelsCellWithAlignment parent={parent} output={data} isStartSection={isStartSection} ctx={ctx} />;
    },
    maxSize: 400,
    minSize: 150,
    size: 250,
  },
  {
    id: "metricsOrData",
    header: () => (
      <span className="truncate text-sm font-medium text-muted-foreground">{isStartSection ? "Matched data item" : "Evaluation metrics"}</span>
    ),
    accessorFn: () => undefined,
    cell: (ctx: CellContext<RowItemData, unknown>) => {
      const data = ctx.row.original;
      if (!isOutputRow(data)) return null;
      const parent = ctx.row.getParentRow()?.original as NodeItemData | undefined;
      if (!parent) return null;
      const actualNodeId = getActualNodeId(ctx.row, data, parent.id);
      return <MetricsCell nodeId={actualNodeId} outputId={data.id} isStartNode={isStartSection} outputType={data.type} />;
    },
    maxSize: 400,
    minSize: 150,
    size: 250,
  },
  {
    id: "evaluationFunctions",
    header: () => <span className="truncate text-sm font-medium text-muted-foreground">Evaluation functions</span>,
    accessorFn: () => undefined,
    cell: (ctx: CellContext<RowItemData, unknown>) => {
      const data = ctx.row.original;
      if (!isOutputRow(data)) return null;
      const parent = ctx.row.getParentRow()?.original as NodeItemData | undefined;
      if (!parent) return null;
      const actualNodeId = getActualNodeId(ctx.row, data, parent.id);
      return <EvaluationFunctionsCell nodeId={actualNodeId} outputId={data.id} outputType={data.type as NodeInputOutputType["type"]} />;
    },
  },
];
