export interface Metric {
  name: "accuracy" | "nmae" | "f1Score" | "precision" | "recall";
  value?: number;
  gtDiff?: number;
  resultPath?: string;
}

type reliabilityMetrics = Record<
  "Accuracy" | "Precision" | "Recall" | "F1-Score",
  {
    value: string;
    count: number;
  }
>;
export const isMetric = (value: unknown): value is Metric => {
  return typeof value === "object" && value !== null && "name" in value && "value" in value;
};

export interface NodeOutput {
  outputKey: string;
  metrics: Metric[];
  children?: NodeOutput[];
}

export interface NodeResult {
  nodeId: string;
  nodeLabel: string;
  metrics: Metric[];
  outputs: NodeOutput[];
  nodeType: string;
  agentKey: string;
  samples: number;
  executionTime: number;
  agenticExEx: number;
  systemicExEx: number;
  flags: number;
  parentNodeId?: string;
}

type ReliableTable = Pick<NodeResult, "samples" | "metrics" | "nodeId"> & { outputKey?: string };

export interface EvaluationResult {
  batchId: string;
  creationDate: number;
  id: string;
  isAggregatedResult: boolean;
  status: EvaluationStatus;
  result: NodeResult[];
  reliabilityOutputs: ReliableTable[];
  reliabilityMetrics: reliabilityMetrics;
  nodesCount: number;
  variablesCount: number;
  totalAgenticExEx: number;
  totalSystemicExEx: number;
  exePercentage: number;
  flagsCount: number;
  totalTime: number;
  averageTimePerSample: string;
  completedEvaluations: number;
  configurationId: string;
  coverage: number;
  completedJobs: number;
  failedJobs: number;
}

export interface EvaluationHistoryItem {
  id: string;
  runningStatus: EvaluationStatus;
  evaluationTitle: string;
  evaluationVersion: string;
  submittedDate: string;
  datasetName: string;
  datasetVersion: string;
  datasetSamples: number;
  successfulSamples: number;
  enoSamples: number;
  executedSamples: number;
  failedSamples: number;
  reliabilityMetrics: {
    Accuracy?: {
      value: string;
      count: number;
    };
  };
  runningTime: string;
  remainingTime: string;
  totalTime: string;
  completedPercentage: number;
  coverage: number;
  exExPercentage: number;
  version: string;
}

export type EvaluationStatus = "Running" | "Pending" | "Finished" | "Failed" | "Paused";

export type EvaluationHistory = {
  items: EvaluationHistoryItem[];
  totalCount: number;
};

export interface startEvaluationInterface {
  singleRowSample?: number;
  configurationDatasetMappingId: string;
  subsetId?: string;
  configurationId: string;
  evaluationSamplesCount: number | undefined;
  description: string;
  runFastTest: boolean;
}
export interface deleteEvaluationInterface {
  batchId: string;
}
export interface EvaluationHistoryData {
  pages: EvaluationHistory[];
  pageParams: number[];
}
