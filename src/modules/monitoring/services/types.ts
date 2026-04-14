import type { NodeIconsMapping } from "@/constants";

import type moment from "moment";

export const TriggerType = {
  NotSpecified: "0",
  EmailTrigger: "1",
  AzureTrigger: "2",
} as const;

export type TriggerTypeKeys = keyof typeof TriggerType;

export type TriggerTypeValues = (typeof TriggerType)[keyof typeof TriggerType];

export interface MonitorApiParams {
  StartDate?: string;
  EndDate?: string;
  TriggerTypes?: TriggerTypeValues[];
  ConfigIds?: string[];
}

export interface VersionDataPoint {
  date: string;
  agenticEXEX: number;
  systemEXEX: number;
  flagsCount: number;
  coverage: number;
  confidence: number;
}

export interface VersionSeries {
  id: string;
  label: string;
  data: VersionDataPoint[];
}

export interface VersionSeriesResponse {
  versionSeries: VersionSeries[];
}

export interface MetricValue {
  value: number;
  totalSamples: number;
}

export interface ExplainableException extends MetricValue {
  exceptionsPercentage: number;
  flagsPercentage: number;
}

export interface MetricsResponse {
  coverage: MetricValue;
  reliabilityConfidence: MetricValue;
  explainableException: ExplainableException;
}
export interface Activity {
  jobId: string;
  status: "Finished" | "Running" | "Failed" | "Pending" | "Cancelled" | "Paused";
  startDateTime: moment.MomentInput;
  triggerType: TriggerTypeKeys;
  executionTime: number;
  hasSystemExceptions: boolean;
  hasAgenticExceptions: boolean;
  hasFlags: boolean;
}

export interface ActivitiesResponse {
  activities: Activity[];
  totalCount: number;
}

export interface OutputItem {
  key: string;
  confidence: number;
  children: OutputItem[];
}

export interface LiveNode {
  nodeId: string;
  nodeLabel: string;
  nodeType: keyof typeof NodeIconsMapping;
  parentNodeId?: string;
  tokenCount: number;
  executionTime: number;
  agentKey: string;
  agenticExEx: number;
  systemicExEx: number;
  flags: number;
  samples: number;
  confidenceScore: number;
  output?: OutputItem[];
}

export interface LiveNodesResponse {
  nodesCount: number;
  output: number;
  totalSamples: number;
  totalTokens: number;
  totalTime: number;
  confidence: number;
  flagsCount: number;
  totalExceptions: number;
  liveNodes: LiveNode[];
}
