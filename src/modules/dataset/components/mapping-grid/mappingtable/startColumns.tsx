import MatchedLabelsCell from "./cells/MatchedLabelsCell";
import NodeColumnCell from "./cells/NodeColumnCell";
import StartMatchedDataItemCell from "./cells/StartMatchedDataItemCell";
import { isOutputRow, type NodeItemData, type RowItemData } from "./types";

import type { CellContext, ColumnDef } from "@tanstack/react-table";

export const createStartColumns = (): ColumnDef<RowItemData, unknown>[] => [
  {
    id: "node",
    header: () => null,
    accessorFn: () => undefined,
    cell: (ctx: CellContext<RowItemData, unknown>) => {
      const data = ctx.row.original;
      if (isOutputRow(data)) {
        const parent = ctx.row.getParentRow()?.original as NodeItemData | undefined;
        if (!parent) return null;
        return <NodeColumnCell node={parent} output={data} isStartNode={true} level={ctx.row.depth} />;
      }
      return null;
    },
    size: 304,
    minSize: 150,
    maxSize: 500,
  },
  {
    id: "matchedLabels",
    header: () => <span className="truncate">Matched labels</span>,
    accessorFn: () => undefined,
    cell: (ctx: CellContext<RowItemData, unknown>) => {
      const data = ctx.row.original;
      if (!isOutputRow(data)) return null;
      const parent = ctx.row.getParentRow()?.original as NodeItemData | undefined;
      if (!parent) return null;
      return <MatchedLabelsCell nodeId={parent.id} outputId={data.id} isStartNode={true} expectedType={data?.type} />;
    },
    maxSize: 400,
    minSize: 150,
    size: 250,
  },
  {
    id: "matchedDataItem",
    header: () => <span className="truncate">Matched data item</span>,
    accessorFn: () => undefined,
    cell: (ctx: CellContext<RowItemData, unknown>) => {
      const data = ctx.row.original;
      if (!isOutputRow(data)) return null;
      const parent = ctx.row.getParentRow()?.original as NodeItemData | undefined;
      if (!parent) return null;

      return <StartMatchedDataItemCell nodeId={parent.id} outputId={data.id} expectedType={null} />;
    },
    maxSize: 400,
    minSize: 150,
    size: 250,
  },
  {
    id: "spacer",
    header: () => null,
    accessorFn: () => undefined,
    cell: () => null,
  },
];
