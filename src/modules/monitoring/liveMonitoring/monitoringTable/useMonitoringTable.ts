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

import { MonitoringNode, MonitoringWorkflowResult } from "./types";
import type { NodeIconsMapping } from "@/constants";
import type { LiveNode, OutputItem } from "@/modules/monitoring/services/types";

/**
 * Transform LiveNodesResponse into a hierarchical tree structure based on parentNodeId
 * Preserves all original LiveNode data and adds children recursively
 */
const transformMonitoringData = (apiData: MonitoringWorkflowResult | null | undefined): MonitoringNode[] => {
  if (!apiData || !apiData.liveNodes || !Array.isArray(apiData.liveNodes)) {
    return [];
  }

  const nodesMap = new Map<string, MonitoringNode>();
  const rootNodes: MonitoringNode[] = [];

  // Helper function to recursively convert OutputItem to MonitoringNode
  const convertOutputToNode = (output: OutputItem, parentNodeId: string, depth: number = 0): MonitoringNode => {
    const outputNodeId = depth === 0 ? `${parentNodeId}_output_${output.key}` : `${parentNodeId}_${output.key}`;

    const outputNode: MonitoringNode = {
      nodeId: outputNodeId,
      id: outputNodeId,
      nodeLabel: output.key,
      nodeType: "identity" as keyof typeof NodeIconsMapping, // Use identity icon for outputs
      parentNodeId: parentNodeId,
      tokenCount: 0,
      executionTime: 0,
      agentKey: "",
      agenticExEx: 0,
      systemicExEx: 0,
      flags: 0,
      samples: 0,
      confidenceScore: output.confidence,
      type: "identity" as keyof typeof NodeIconsMapping,
      children:
        output.children && output.children.length > 0
          ? output.children.map((childOutput) => convertOutputToNode(childOutput, outputNodeId, depth + 1))
          : undefined,
    };
    return outputNode;
  };

  // First pass: Create nodes with all original LiveNode data
  apiData.liveNodes.forEach((liveNode: LiveNode) => {
    const node: MonitoringNode = {
      ...liveNode, // Spread all original LiveNode properties
      id: liveNode.nodeId, // Add required id property
      type: (liveNode.nodeType?.toLowerCase() === "agent" ? liveNode.agentKey : liveNode.nodeType) as keyof typeof NodeIconsMapping, // Computed type for NodeCell component
      children: [], // Initialize children array
    };

    nodesMap.set(liveNode.nodeId, node);
  });

  // Second pass: Build tree structure by linking node children to parents
  apiData.liveNodes.forEach((liveNode: LiveNode) => {
    const currentNode = nodesMap.get(liveNode.nodeId);

    if (!currentNode) return;

    if (liveNode.parentNodeId) {
      // This node has a parent, add it as a child
      const parentNode = nodesMap.get(liveNode.parentNodeId);
      if (parentNode) {
        if (!parentNode.children) {
          parentNode.children = [];
        }
        parentNode.children.push(currentNode);
      } else {
        // Parent not found, treat as root
        rootNodes.push(currentNode);
      }
    } else {
      // No parent, this is a root node
      rootNodes.push(currentNode);
    }
  });

  // Third pass: Add outputs as sibling children to each node
  // Outputs will appear alongside any node children in the tree
  apiData.liveNodes.forEach((liveNode: LiveNode) => {
    const currentNode = nodesMap.get(liveNode.nodeId);

    if (!currentNode || !liveNode.output || liveNode.output.length === 0) return;

    // Convert outputs to nodes (with recursive children support) and add as siblings
    const outputNodes = liveNode.output.map((output) => convertOutputToNode(output, liveNode.nodeId, 0));

    if (!currentNode.children) {
      currentNode.children = [];
    }

    // Outputs are added as siblings to any existing node children
    currentNode.children.push(...outputNodes);
  });

  // Clean up empty children arrays
  const cleanupEmptyChildren = (node: MonitoringNode) => {
    if (node.children && node.children.length === 0) {
      delete node.children;
    } else if (node.children) {
      node.children.forEach(cleanupEmptyChildren);
    }
  };

  rootNodes.forEach(cleanupEmptyChildren);

  return rootNodes;
};

export const useMonitoringTable = (
  apiData: MonitoringWorkflowResult | null | undefined,
  columns: ColumnDef<MonitoringNode>[],
  meta?: TableMeta<MonitoringNode>
) => {
  const data = useMemo(() => transformMonitoringData(apiData), [apiData]);

  const getInitialExpandedState = () => {
    const expandedState: Record<string, boolean> = {};

    const processRows = (rows: MonitoringNode[], parentPath: string = "") => {
      rows.forEach((row, index) => {
        const rowPath = parentPath ? `${parentPath}.${index}` : `${index}`;
        const depth = rowPath.split(".").length - 1;

        // Auto-expand first level
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
