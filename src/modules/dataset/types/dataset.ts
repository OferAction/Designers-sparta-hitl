import { MetricType } from "./metrics";
import { TreeItem } from "@/components/ui/tree-view";

import type { PreprocessingFunctionWithParams } from "./preprocessing";
export interface Dataset {
  id: string;
  hasMapping?: boolean;
  name: string;
  createdTime: string;
  activeVersionId: string;
  mappingId: string;
  samplesCount: number;
  configurationNames: string[];
  subsets: Subset[];
}

export interface Subset {
  id: string;
  name: string;
  batchId: string;
  datasetId: string;
  datasetName: string;
  jobs: Job[];
  subsetJobCount: number;
  createdTime: string;
  updateTime: string;
  isDeleted: boolean;
}

export interface Job {
  jobId: string;
}

export interface DatasetStructureItem {
  name: string;
  type: string;
  sample: string | object;
  id?: string; // json path
  children: DatasetStructureItem[];
}

export interface DatasetInfo {
  id: string;
  name: string;
  description?: string;
  createdTime: string;
  updatedTime: string;
  activeVersionId: string;
  labelsCount: number;
  dataItemsCount: number;
  samplesCount: number;
  headerInfo?: DatasetStructureItem[];
}

export interface NodeMapping {
  nodeId: string;
  outputId: string;
  dataItem: TreeItem;
  jsonPath: string;
  metrics: MetricType[];
  metricParams?: {
    accuracyMargin?: number;
    positives?: string[];
    classes?: string[];
    labels?: string[];
  };
  preprocessingFunctions?: PreprocessingFunctionWithParams[];
}

export type DatasetsResponse = Dataset[];

export interface MetricPayload {
  metric: number;
  list_of_positives?: string[];
  list_of_classes?: string[];
  class_labels?: string[];
  labels?: string[];
  r?: number;
}

export interface OutputDatasetMapping {
  nodeId: string;
  outputId: string;
  outputKey: string;
  jsonPathId: string;
  metrics?: MetricPayload[];
  preprocessingFunctions?: Array<{
    name: string;
    params?: Record<string, string>;
  }>;
}

export interface InputListItem {
  nodeId: string;
  outputId: string;
  outputKey: string;
  jsonPathId: string;
}

export interface DatasetMappingRequest {
  fileId: string;
  datasetVersionId: string;
  outputsDatasetMapping: OutputDatasetMapping[];
  inputsList: InputListItem[];
  flaggedNodesOutputsFrontend: string[];
  alignmentKeys: DatasetAlignmentKeys[];
}

export interface DatasetAlignmentKeys {
  nodeId: string;
  outputId: string;
}

export interface DatasetMappingResponse {
  id: string;
  configurationId: string;
  datasetVersionId: string;
  outputsDatasetMapping: OutputDatasetMapping[];
  inputsList: InputListItem[];
  alignmentKeys: DatasetAlignmentKeys[];
  flaggedNodesOutputsFrontend: string[];
  flaggedNodesOutputsBackend: string[];
  createdTime: string;
  updatedTime: string;
}

interface VersionInfo {
  id: string;
  major: number;
  minor: number;
  patch: number;
  timestamp: string;
  samplesCount: number;
  headerInfo: string;
  labelsCount: number;
  dataItemsCount: number;
  sampleExample: string;
}

export interface DatasetVersionResponse {
  id: string;
  isActive: boolean;
  blobPath: string;
  zipUrl: string;
  status: string;
  versionInfo: VersionInfo;
  datasetId: string;
}

export interface DatasetSampleResponse {
  inputsDict: Record<string, any>;
}
