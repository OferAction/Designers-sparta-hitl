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
import { EvaluationResult, Metric, NodeOutput } from "../types";

/**
 * Builds a case-insensitive map of metrics by name.
 */
const createMetricsMap = (metrics: Metric[] | undefined): Record<string, Metric> => {
  const metricsMap: Record<string, Metric> = {};
  metrics?.forEach((metric: Metric) => {
    metricsMap[metric.name.toLowerCase()] = metric;
  });
  return metricsMap;
};

/**
 * Recursively transforms a node output into an evaluation table row.
 */
const mapOutputToEvaluationNode = (output: NodeOutput, nodeId: string): EvaluationNode => {
  const outputMetricsMap = createMetricsMap(output.metrics);
  const children = output.children?.map((child) => mapOutputToEvaluationNode(child, nodeId));

  return {
    id: output.outputKey,
    label: output.outputKey,
    nodeId,
    accuracy: outputMetricsMap.accuracy || ({} as Metric),
    nmae: outputMetricsMap.nmae || ({} as Metric),
    f1Score: outputMetricsMap.f1score || ({} as Metric),
    precision: outputMetricsMap.precision || ({} as Metric),
    recall: outputMetricsMap.recall || ({} as Metric),
    children: children && children.length > 0 ? children : undefined,
  };
};

/**
 * Converts a raw node result into a table row.
 */
const mapNodeResultToEvaluationNode = (nodeResult: EvaluationResult["result"][number]): EvaluationNode => {
  const metricsMap = createMetricsMap(nodeResult.metrics);

  return {
    label: nodeResult.nodeLabel || nodeResult.nodeId,
    id: nodeResult.nodeId,
    nodeId: nodeResult.nodeId,
    samples: nodeResult.samples,
    type: (nodeResult.nodeType.toLocaleLowerCase() === "agent" ? nodeResult.agentKey : nodeResult.nodeType) as EvaluationNode["type"],
    tokens: undefined,
    time: nodeResult.executionTime,
    agenticExEx: nodeResult.agenticExEx,
    systemicExEx: nodeResult.systemicExEx,
    flags: nodeResult.flags,
    accuracy: metricsMap.accuracy || ({} as Metric),
    recall: metricsMap.recall || ({} as Metric),
    nmae: metricsMap.nmae || ({} as Metric),
    f1Score: metricsMap.f1score || ({} as Metric),
    precision: metricsMap.precision || ({} as Metric),
  };
};

/**
 * Removes empty children arrays recursively from the generated tree.
 */
const cleanupEmptyChildren = (node: EvaluationNode): void => {
  if (!node.children || node.children.length === 0) {
    delete node.children;
    return;
  }

  node.children.forEach(cleanupEmptyChildren);
};

/**
 * Transforms evaluation API data into a hierarchical table tree.
 */
const transformEvaluationData = (apiData: EvaluationResult | null | undefined): EvaluationNode[] => {
  if (!apiData || !apiData.result || !Array.isArray(apiData.result)) {
    return [];
  }

  const nodesMap = new Map<string, EvaluationNode>();
  const rootNodes: EvaluationNode[] = [];

  apiData.result.forEach((nodeResult) => {
    nodesMap.set(nodeResult.nodeId, {
      ...mapNodeResultToEvaluationNode(nodeResult),
      children: [],
    });
  });

  apiData.result.forEach((nodeResult) => {
    const currentNode = nodesMap.get(nodeResult.nodeId);

    if (!currentNode) {
      return;
    }

    if (nodeResult.parentNodeId) {
      const parentNode = nodesMap.get(nodeResult.parentNodeId);
      if (parentNode) {
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push(currentNode);
      } else {
        rootNodes.push(currentNode);
      }
      return;
    }

    rootNodes.push(currentNode);
  });

  apiData.result.forEach((nodeResult) => {
    const currentNode = nodesMap.get(nodeResult.nodeId);
    if (!currentNode || !nodeResult.outputs || nodeResult.outputs.length === 0) {
      return;
    }

    const outputNodes = nodeResult.outputs.map((output: NodeOutput) => mapOutputToEvaluationNode(output, nodeResult.nodeId));
    if (!currentNode.children) {
      currentNode.children = [];
    }
    currentNode.children.push(...outputNodes);
  });

  rootNodes.forEach(cleanupEmptyChildren);

  return rootNodes;
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
