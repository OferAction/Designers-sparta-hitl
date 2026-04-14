import { CellContext, createColumnHelper, SortingFnOption } from "@tanstack/react-table";

import { EvaluationNode } from "./types";
import { BadgeCell } from "../components/cells/BadgeCell";
import { HeaderCell } from "../components/cells/HeaderCell";
import { NodeCell } from "../components/cells/NodeCell";
import { ProgressCell } from "../components/cells/ProgressCell";
import { SampleCell } from "../components/cells/SampleCell";
import { EvaluationResult } from "../types";
import { sortByMetricValue } from "../utils";

const columnHelper = createColumnHelper<EvaluationNode>();

// Helper function to sort by numeric value (handles undefined/null)
const sortByNumericValue: SortingFnOption<EvaluationNode> = (rowA, rowB, columnId) => {
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

export const createColumns = (apiData: EvaluationResult | null | undefined) => [
  // Group 1: Node Information
  columnHelper.group({
    id: "nodeInfo",
    header: () => null,
    meta: {
      defaultSize: 20, // percentage
    },
    columns: [
      columnHelper.accessor("label", {
        header: (context) => {
          const nodeCount = apiData?.nodesCount;
          const variablesCount = apiData?.variablesCount;
          return <HeaderCell title={`${nodeCount} Node`} subtitle={`${variablesCount} Variables`} showSort header={context.header} />;
        },
        cell: (context: CellContext<EvaluationNode, any> & { globalFilter?: string }) => (
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
          return <HeaderCell title="Samples" subtitle={apiData?.completedEvaluations} header={context.header} />;
        },
        cell: ({ cell, getValue, row }) => {
          return <SampleCell value={getValue()} cell={cell} batchId={apiData?.batchId || ""} nodeId={row.original.id} />;
        },
        minSize: 60,
        size: 103,
        maxSize: 300,
        enableSorting: true,
        sortingFn: sortByNumericValue,
      }),
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

      columnHelper.accessor("tokens", {
        header: (context) => <HeaderCell title="Tokens" header={context.header} />,
        cell: (info) => <p> {info.getValue()} </p>,
        minSize: 61,
        size: 93,
        maxSize: 100,
        enableSorting: true,
        sortingFn: sortByNumericValue,
      }),
      columnHelper.accessor("time", {
        header: (context) => {
          const totalTime = apiData?.totalTime;
          return <HeaderCell title="Time" subtitle={`${totalTime?.toFixed(2)}s`} header={context.header} />;
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
      columnHelper.accessor("accuracy", {
        header: (context) => (
          <HeaderCell
            title="Accuracy"
            tooltip="percentage of samples with predictions that match to the ground truth labels"
            header={context.header}
          />
        ),
        cell: ({ cell, getValue }) => <ProgressCell value={getValue().value} cell={cell} showPercent gtDiff={getValue().gtDiff} />,
        size: 120,
        enableSorting: true,
        sortingFn: sortByMetricValue,
      }),
      columnHelper.accessor("nmae", {
        header: (context) => (
          <HeaderCell title="NMAE" tooltip="Average absolute prediction error as a percentage of the true value." header={context.header} />
        ),
        cell: ({ cell, getValue }) => <ProgressCell value={getValue().value} cell={cell} gtDiff={getValue().gtDiff} />,
        size: 100,
        enableSorting: true,
        sortingFn: sortByMetricValue,
      }),
      columnHelper.accessor("f1Score", {
        header: (context) => (
          <HeaderCell title="F1 Score" subtitle="0-1" header={context.header} tooltip="Combined measure of precision and recall in one score." />
        ),
        cell: ({ cell, getValue }) => <ProgressCell value={getValue().value} cell={cell} gtDiff={getValue().gtDiff} />,
        size: 120,
        enableSorting: true,
        sortingFn: sortByMetricValue,
      }),
      columnHelper.accessor("precision", {
        id: "precision",
        header: (context) => (
          <HeaderCell
            title="Precision"
            subtitle="0-100%"
            header={context.header}
            tooltip="Percent of predicted positives that were actually correct."
          />
        ),
        cell: ({ cell, getValue }) => <ProgressCell value={getValue().value} cell={cell} showPercent gtDiff={getValue().gtDiff} />,
        size: 120,
        enableSorting: true,
        sortingFn: sortByMetricValue,
      }),
      columnHelper.accessor("recall", {
        id: "recall",
        header: (context) => (
          <HeaderCell title="Recall" subtitle="0-100%" header={context.header} tooltip="Percent of actual positives that successfully identified." />
        ),
        cell: ({ cell, getValue }) => <ProgressCell value={getValue().value} cell={cell} showPercent gtDiff={getValue().gtDiff} />,
        size: 120,
        enableSorting: true,
        sortingFn: sortByMetricValue,
      }),
    ],
  }),

  // Group 4: Error Metrics
  columnHelper.group({
    id: "errors",
    header: () => null,
    meta: {
      defaultSize: 35, // percentage
    },
    columns: [
      columnHelper.accessor("agenticExEx", {
        id: "agenticErrors",
        header: (context) => {
          const totalAgenticExEx = apiData?.totalAgenticExEx;
          return (
            <HeaderCell
              title="Agentic ExEx"
              subtitle={totalAgenticExEx}
              tooltip="Explainable Exceptions that failed due to rules in the workflow"
              header={context.header}
            />
          );
        },
        cell: ({ cell, getValue }) => (
          <div className="w-full">
            <BadgeCell value={getValue()} cell={cell} variant="warning" />
          </div>
        ),
        minSize: 150,
        maxSize: 150,
        enableSorting: true,
        sortingFn: sortByNumericValue,
      }),
      columnHelper.accessor("systemicExEx", {
        id: "systemErrors",
        header: (context) => {
          const totalSystemicExEx = apiData?.totalSystemicExEx;
          return (
            <HeaderCell
              title="System ExEx"
              subtitle={totalSystemicExEx}
              tooltip="Explainable Exceptions that failed due to technical issues in the workflow"
              header={context.header}
            />
          );
        },
        cell: ({ cell, getValue }) => (
          <div className="w-full">
            <BadgeCell value={getValue()} cell={cell} variant="destructive" />
          </div>
        ),
        minSize: 150,
        maxSize: 150,
        enableSorting: true,
        sortingFn: sortByNumericValue,
      }),
    ],
  }),
];
