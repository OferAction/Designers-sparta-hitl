import { RuleStatus } from "@/modules/flow/components/ExecutionPanels/types";
import { NodeExecutionState } from "@/store/executionStore";

export interface NodeOutputResponse {
  jobId: string;
  nodeId: string;
  input: Record<string, any>;
  output: Record<string, any>;
  executionTime: number;
}

export interface NodeResultRules {
  id: string;
  status: RuleStatus;
  message?: string;
  action?: string;
  additional?: Record<string, any>;
}

export interface NodeResultResponse {
  nodeId: string;
  errorMessages: string;
  fromCache: boolean;
  input: Record<string, any>;
  output: Record<string, any>;
  groundTruth: Record<string, any>;
  inputFileKeys: string[];
  outputFileKeys: string[];
  rules: NodeResultRules[];
  executionTime: number;
  maxIterations?: number[];
}

export interface LogItem {
  serviceName: string;
  logLevel: "INFO" | "DEBUG" | "WARNING" | "ERROR" | "CRITICAL";
  message: string;
  additionalData: Record<string, any>;
  jobId: string;
  nodeId: string;
  iteration: any[];
  engineTime: string;
  maxIterations: any[];
}

export interface ExecutionLogResponse {
  totalCount: number;
  items: LogItem[];
  maxIterations: number[];
  iterations: number[];
}

// Map API status strings to execution store states
export type NodeApiStatus = "started" | "completed" | "failed" | "pruned" | "";

// API response extends execution state with additional metrics and metadata
export interface NodeStatusData extends Omit<NodeExecutionState, "executionResult"> {
  status: NodeApiStatus;
  systemExCount: number;
  agenticExCount: number;
  flagsCount: number;
  additionalFields: {
    sourceNodes: string[];
  };
  // Inherited from NodeExecutionState: systemRuleCount, builtInRuleCount, fromCache, executionTime
}

export type NodeStatusResponse = Record<string, NodeStatusData>;
