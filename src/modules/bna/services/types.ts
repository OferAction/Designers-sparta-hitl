import { TriggerTypeValues } from "@/modules/monitoring/services/types";

export const ClickedColumn = {
  samples: 0,
  flags: 1,
  gtDiff: 2,
  agenticErrors: 3,
  systemErrors: 4,
  confidence: 5,
} as const;

export type ClickedColumn = (typeof ClickedColumn)[keyof typeof ClickedColumn];

export interface SubsetFilterParams {
  ResultPath: string;
  BatchId: string;
  FileId?: string;
  ConfigurationId?: string;
  ClickedColumn?: ClickedColumn;
  MetricName?: string;
}

export interface SubsetFilterParamsMonitoring {
  ResultPath: string;
  FileId: string;
  ClickedColumn?: ClickedColumn;
  StartDate?: string;
  EndDate?: string;
  TriggerTypes?: TriggerTypeValues[];
}

export interface NodeResultSubsetDto {
  type?: "GtDiff" | "Flags" | "SystemExEx" | "AgentExEx";
  jobId: string;
  sampleIndex?: number;
}

export interface SubsetFilterResponse {
  subsetId?: string;
  subsetName: string;
  datasetId?: string;
  datasetName?: string;
  evaluationName?: string;
  evaluationDate?: string;
  hasSubset?: boolean;
  nodeResultSubsetDtos: NodeResultSubsetDto[];
}
