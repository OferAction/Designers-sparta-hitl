import { Edge as FlowEdge, EdgeProps as FlowEdgeProps, HandleType } from "@xyflow/react";

import { Node } from "./BaseNodeTypes";

// Define the base properties for an edge
type BaseEdgeProps = {
  targetNodeType?: Node["type"] | null;
  showEdgeMenuPlus?: boolean;
};

// Extend the Edge type to include BaseEdgeProps in the `data` attribute
export type Edge<EdgeData extends Record<string, unknown> = Record<string, unknown>> = FlowEdge & {
  data: EdgeData & BaseEdgeProps; // Merge BaseEdgeProps into the `data` attribute
  style?: React.CSSProperties;
  className?: string;
  /**
   * Determines whether the edge can be updated by dragging the source or target to a new node.
   * This property will override the default set by the `edgesReconnectable` prop on the
   * `<ReactFlow />` component.
   */
  reconnectable?: boolean | HandleType;
  focusable?: boolean;
};

// Extend EdgeProps to include the updated Edge type
export type EdgeProps<EdgeType extends Edge = Edge> = FlowEdgeProps<EdgeType>;
export type EdgeState = "default" | "error" | "success";
export type EdgeMode = "default" | "running" | "evaluating";
