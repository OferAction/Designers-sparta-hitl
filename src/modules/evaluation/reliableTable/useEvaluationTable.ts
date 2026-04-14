import { useMemo, useState } from "react";

import {
  ColumnDef,
  ExpandedState,
  getCoreRowModel,
  getExpandedRowModel,
  getSortedRowModel,
  SortingState,
  TableMeta,
  useReactTable,
} from "@tanstack/react-table";

import { EvaluationNode } from "./types";
import { EvaluationResult, Metric } from "../types";

const transformEvaluationData = (apiData: EvaluationResult | null | undefined): EvaluationNode[] => {
  if (!apiData || !apiData.result || !Array.isArray(apiData.result)) {
    return [];
  }

  return apiData.reliabilityOutputs.map((nodeResult): EvaluationNode => {
    const metricsMap: Record<string, Metric> = {};
    nodeResult.metrics?.forEach((metric: Metric) => {
      metricsMap[metric.name.toLowerCase()] = metric;
    });

    // const children =
    //   nodeResult.outputs?.map((output: NodeOutput) => {
    //     const outputMetricsMap: Record<string, Metric> = {};
    //     output.metrics?.forEach((metric: Metric) => {
    //       outputMetricsMap[metric.name.toLowerCase()] = metric;
    //     });

    //     return {
    //       id: output.outputKey,
    //       label: output.outputKey,
    //       accuracy: outputMetricsMap.accuracy || {},
    //       nmae: outputMetricsMap.nmae || {},
    //       f1Score: outputMetricsMap.f1score || {},
    //       precision: outputMetricsMap.precision || {},
    //       recall: metricsMap.recall || {},
    //     };
    //   }) || [];

    return {
      label: nodeResult.outputKey || "Unnamed Output",
      id: nodeResult.outputKey || "",
      nodeId: nodeResult.nodeId || nodeResult.outputKey || "",
      samples: nodeResult.samples,
      // type: (nodeResult.nodeType.toLocaleLowerCase() === "agent" ? nodeResult.agentKey : nodeResult.nodeType) as EvaluationNode["type"],
      // tokens: undefined,
      // time: nodeResult.executionTime,
      // agenticExEx: nodeResult.agenticExEx,
      // systemicExEx: nodeResult.systemicExEx,
      // flags: nodeResult.flags,
      accuracy: metricsMap.accuracy || {},
      recall: metricsMap.recall || {},
      nmae: metricsMap.nmae || {},
      f1Score: metricsMap.f1score || {},
      precision: metricsMap.precision || {},
      // children: children.length > 0 ? children : undefined,
    };
  });
};

export const useEvaluationTable = (
  apiData: EvaluationResult | null | undefined,
  columns: ColumnDef<EvaluationNode>[],
  meta?: TableMeta<EvaluationNode>
) => {
  const data = useMemo(() => transformEvaluationData(apiData), [apiData]);

  const getInitialExpandedState = () => {
    const expandedState: Record<string, boolean> = {};

    const processRows = (rows: EvaluationNode[], parentPath: string = "") => {
      rows.forEach((row, index) => {
        const rowPath = parentPath ? `${parentPath}.${index}` : `${index}`;
        const depth = rowPath.split(".").length - 1;

        if (depth >= 1) {
          expandedState[rowPath] = true;
        }

        if (row.children && row.children.length > 0) {
          processRows(row.children, rowPath);
        }
      });
    };

    processRows(data);
    return expandedState;
  };

  const [expanded, setExpanded] = useState<ExpandedState>(getInitialExpandedState);
  const [columnSizing, setColumnSizing] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});

  const tableData = useMemo(() => [...data], [data]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      expanded,
      columnSizing,
      sorting,
      columnVisibility,
    },
    onExpandedChange: setExpanded,
    onColumnSizingChange: setColumnSizing,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    columnResizeMode: "onChange",
    enableColumnResizing: true,
    enableSorting: true,
    columnResizeDirection: "ltr",
    getSubRows: (row) => row.children,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    maxLeafRowFilterDepth: 0, // Only sort/filter top-level rows
    meta,
  });

  return table;
};
