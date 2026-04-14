import { NodeIconsMapping } from "@/constants";
import { LiveNode, LiveNodesResponse } from "@/modules/monitoring/services/types";

export interface MetricValue {
  value: number;
  gtDiff?: number;
}

export interface MonitoringNode extends LiveNode {
  id: string;
  type?: keyof typeof NodeIconsMapping;
  children?: MonitoringNode[];
};

// Re-export LiveNodesResponse as MonitoringWorkflowResult for consistency
export type MonitoringWorkflowResult = LiveNodesResponse;
