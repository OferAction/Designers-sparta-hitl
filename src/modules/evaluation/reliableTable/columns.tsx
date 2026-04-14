import { CellContext, createColumnHelper } from "@tanstack/react-table";

import { EvaluationNode } from "./types";
import { HeaderCell } from "../components/cells/HeaderCell";
import { NodeCell } from "../components/cells/NodeCell";
import { ProgressCell } from "../components/cells/ProgressCell";
import { SampleCell } from "../components/cells/SampleCell";
import { EvaluationResult } from "../types";
import { sortByMetricValue } from "../utils";

const columnHelper = createColumnHelper<EvaluationNode>();

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
          return <HeaderCell title={`Reliability properties`} showSort header={context.header} />;
        },
        cell: (context: CellContext<EvaluationNode, any> & { globalFilter?: string }) => (
          <NodeCell className="text-blue-foreground" cell={context.cell} value={context.getValue()} globalFilter={context.globalFilter} />
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
          return <HeaderCell title="Samples" header={context.header} />;
        },
        cell: ({ cell, getValue, row }) => {
          return (
            <SampleCell badgeClassName="bg-accent/50" value={getValue()} cell={cell} batchId={apiData?.batchId || ""} nodeId={row.original.nodeId} />
          );
        },
        minSize: 60,
        size: 103,
        maxSize: 300,
        enableSorting: true,
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
        cell: ({ cell, getValue }) => (
          <ProgressCell
            ProgressclassName="h-1"
            indicatorClassName="bg-blue-foreground"
            value={getValue().value}
            cell={cell}
            showPercent
            gtDiff={getValue().gtDiff}
          />
        ),
        size: 120,
        enableSorting: true,
        sortingFn: sortByMetricValue,
      }),
      columnHelper.accessor("nmae", {
        header: (context) => <HeaderCell title="NMAE" tooltip="Nominal Mean Average Error" header={context.header} />,
        cell: ({ cell, getValue }) => <ProgressCell value={getValue().value} cell={cell} gtDiff={getValue().gtDiff} />,
        size: 100,
        enableSorting: true,
        sortingFn: sortByMetricValue,
      }),
      columnHelper.accessor("f1Score", {
        header: (context) => <HeaderCell title="F1 Score" header={context.header} />,
        cell: ({ cell, getValue }) => <ProgressCell value={getValue().value} cell={cell} gtDiff={getValue().gtDiff} />,
        size: 120,
        enableSorting: true,
        sortingFn: sortByMetricValue,
      }),
      columnHelper.accessor("precision", {
        id: "precision",
        header: (context) => <HeaderCell title="Precision" header={context.header} />,
        cell: ({ cell, getValue }) => <ProgressCell value={getValue().value} cell={cell} showPercent gtDiff={getValue().gtDiff} />,
        size: 120,
        enableSorting: true,
        sortingFn: sortByMetricValue,
      }),
      columnHelper.accessor("recall", {
        id: "recall",
        header: (context) => <HeaderCell title="Recall" header={context.header} />,
        cell: ({ cell, getValue }) => <ProgressCell value={getValue().value} cell={cell} showPercent gtDiff={getValue().gtDiff} />,
        size: 120,
        enableSorting: true,
        sortingFn: sortByMetricValue,
      }),
    ],
  }),
];
