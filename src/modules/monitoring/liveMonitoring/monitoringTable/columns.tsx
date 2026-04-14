import { CellContext, createColumnHelper, SortingFnOption } from "@tanstack/react-table";

import { MonitoringNode, MonitoringWorkflowResult } from "./types";
import { BadgeCell } from "@/modules/evaluation/components/cells/BadgeCell";
import { HeaderCell } from "@/modules/evaluation/components/cells/HeaderCell";
import { NodeCell } from "@/modules/evaluation/components/cells/NodeCell";
import { ProgressCell } from "@/modules/evaluation/components/cells/ProgressCell";
import { SampleCell } from "@/modules/evaluation/components/cells/SampleCell";

const columnHelper = createColumnHelper<MonitoringNode>();

// Helper function to sort by numeric value (handles undefined/null)
const sortByNumericValue: SortingFnOption<MonitoringNode> = (rowA, rowB, columnId) => {
  const valueA = rowA.getValue<number | undefined>(columnId);
  const valueB = rowB.getValue<number | undefined>(columnId);

  const isAEmpty = valueA === undefined || valueA === null || valueA === 0;
  const isBEmpty = valueB === undefined || valueB === null || valueB === 0;

  // Both empty - maintain order
  if (isAEmpty && isBEmpty) return 0;
  // Only A is empty - push A to end
  if (isAEmpty) return 1;
  // Only B is empty - push B to end
  if (isBEmpty) return -1;

  // Both have values - normal numeric sort
  return valueB - valueA;
};

export const createColumns = (apiData: MonitoringWorkflowResult | null | undefined) => [
  // Group 1: Node Information
  columnHelper.group({
    id: "nodeInfo",
    header: () => null,
    meta: {
      defaultSize: 20, // percentage
    },
    columns: [
      columnHelper.accessor("nodeLabel", {
        header: (context) => {
          const nodeCount = apiData?.nodesCount;
          const output = apiData?.output;
          return <HeaderCell title={`${nodeCount} Node`} subtitle={`${output} Outputs`} showSort header={context.header} />;
        },
        cell: (context: CellContext<MonitoringNode, any> & { globalFilter?: string }) => (
          <NodeCell cell={context.cell} value={context.getValue()} globalFilter={context.globalFilter} />
        ),
        minSize: 150,
        size: 150,
        enableSorting: true,
        sortDescFirst: false,
        sortingFn: (rowA, rowB) => {
          return rowA.index - rowB.index;
        },
      }),
    ],
  }),

  // Group 2: Performance Metrics
  columnHelper.group({
    id: "performance",
    header: () => null,
    meta: {
      defaultSize: 30, // percentage
    },
    columns: [
      columnHelper.accessor("samples", {
        header: (context) => {
          return <HeaderCell title="Items" subtitle={apiData?.totalSamples} header={context.header} />;
        },
        cell: ({ cell, getValue, row }) => {
          return <SampleCell value={getValue()} cell={cell} batchId={""} nodeId={row.original.id} />;
        },
        minSize: 60,
        size: 103,
        maxSize: 300,
        enableSorting: true,
        sortingFn: sortByNumericValue,
      }),

      columnHelper.accessor("tokenCount", {
        header: (context) => <HeaderCell title="Tokens" header={context.header} />,
        cell: (info) => <p> {info.getValue()} </p>,
        minSize: 61,
        size: 93,
        maxSize: 100,
        enableSorting: true,
        sortingFn: sortByNumericValue,
      }),
      columnHelper.accessor("executionTime", {
        header: (context) => {
          const totalTime = apiData?.totalTime;
          return <HeaderCell title="Av. Time" subtitle={totalTime ? `${totalTime.toFixed(2)}s` : "--"} header={context.header} />;
        },
        cell: (info) => {
          const value = info.getValue();
          if (value === null || value === undefined) return null;
          if (value < 0.01) return <span>{"<10ms"}</span>;
          return <span>{value?.toFixed(2)}s</span>;
        },
        minSize: 60,
        size: 92,
        maxSize: 100,
        enableSorting: true,
        sortingFn: sortByNumericValue,
      }),
    ],
  }),

  // Group 3: Quality Metrics

  columnHelper.group({
    id: "quality",
    header: () => null,
    meta: {
      defaultSize: 15, // percentage
    },
    columns: [
      columnHelper.accessor("confidenceScore", {
        header: (context) => (
          <HeaderCell
            title="Confidence"
            tooltip="percentage of samples with predictions that match to the ground truth labels"
            header={context.header}
          />
        ),
        cell: ({ cell, getValue }) => <ProgressCell value={getValue()} cell={cell} showPercent gtDiff={0} />,
        size: 100,
        enableSorting: true,
      }),
    ],
  }),

  // Group 4: Error Metrics
  columnHelper.group({
    id: "errors",
    header: () => null,
    meta: {
      defaultSize: 15, // percentage
    },
    columns: [
      columnHelper.accessor("flags", {
        header: (context) => {
          const flagsCount = apiData?.flagsCount;
          return (
            <HeaderCell title="Flags" subtitle={flagsCount} tooltip="succeeded samples with failed ExEx in their execution" header={context.header} />
          );
        },
        cell: ({ cell, getValue }) => {
          // if (!getValue()) return null;
          return (
            <BadgeCell className="text-warning bg-accent text-xs group-hover:text-foreground" value={getValue()} cell={cell}>
              <div className="size-1 rounded-full bg-warning"></div>
            </BadgeCell>
          );
        },
        minSize: 60,
        size: 97,
        maxSize: 100,
        enableSorting: true,
        sortingFn: sortByNumericValue,
      }),
      columnHelper.accessor("systemicExEx", {
        id: "exceptions",
        header: (context) => {
          const totalAgenticExEx = apiData?.liveNodes?.reduce((sum, node) => sum + (node.agenticExEx || 0), 0) || 0;
          const totalSystemicExEx = apiData?.liveNodes?.reduce((sum, node) => sum + (node.systemicExEx || 0), 0) || 0;
          const totalExceptions = totalAgenticExEx + totalSystemicExEx;
          return (
            <HeaderCell
              title="Exceptions"
              subtitle={totalExceptions}
              tooltip="Explainable Exceptions that failed due to rules or technical issues in the workflow"
              header={context.header}
            />
          );
        },
        cell: ({ cell, row }) => (
          <div className="w-full flex items-center gap-1">
            <BadgeCell value={row.original.agenticExEx} cell={cell} variant="warning" />
            <BadgeCell value={row.original.systemicExEx} cell={cell} variant="destructive" />
          </div>
        ),
        minSize: 80,
        maxSize: 80,
        enableSorting: true,
        sortingFn: sortByNumericValue,
      }),
    ],
  }),
];
