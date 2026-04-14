import { EvaluationStatus } from "@/modules/evaluation/types";

export interface GenOneNotificationEvent {
  workflowStatus: boolean;
  message?: string;
  configuration?: string;
}

export interface ServerToClientEvents {
  message: (message: string) => void;
  ping: () => void;
  pong: () => void;
  error: (error: string) => void;
  disconnect: () => void;
  connect: () => void;
  ReceiveMessage: Handlers;
  ReceiveEngineBatchStarted: (event: BatchEvent) => void;
  ReceiveNotification: (event: NodeResultEvent & EvaluationEvent) => void;
  ReceiveConfigurationNotification: (event: ConfigurationFileUpdateEvent) => void;
}

export interface ConfigurationFileUpdateEvent {
  eventType: "configurations_file_updated";
  payload: {
    fileId: string;
  };
}

export interface BatchEvent {
  eventType: "engine_batch_completed" | "engine_batch_started";
  batchId: string;
  status: EvaluationStatus;
  message: string;
  fileId: string;
}

export interface NodeResultEvent {
  jobId: string;
  nodeId: string;
  executionTime: number;
  fromCache: boolean;
  builtInRuleCount: number;
  systemRuleCount: number;
}

export interface EvaluationEvent {
  eventId: string;
  eventType: "evaluation_started" | "evaluation_completed";
  jobId: string;
  fileId: string;
  batchId: string;
}

type Handlers = ReceiveMessageHandlers;
type ReceiveMessageHandlers = (event: Event) => void;

type Event = GraphEvent | NodeEvent | RuleEvent;
export interface GraphEvent {
  eventType: "engine_graph_completed" | "engine_graph_failed";
  payload: {
    jobId: string;
    nodeId: string;
  };
}

export interface NodeEvent {
  eventType: "engine_node_started" | "engine_node_completed" | "engine_node_failed" | "engine_node_pruned";
  payload: {
    jobId: string;
    nodeId: string;
    additionalFields: {
      sourceNodes: string[];
    };
  };
}

export interface RuleEvent {
  eventType: "engine_rule_started" | "engine_rule_completed" | "engine_rule_failed";
  payload: {
    jobId: string;
    nodeId: string;
    ruleId: string;
  };
}

export const isNodeEvent = (event: Event): event is NodeEvent => {
  return ["engine_node_started", "engine_node_completed", "engine_node_failed", "engine_node_pruned"].includes(event.eventType);
};
