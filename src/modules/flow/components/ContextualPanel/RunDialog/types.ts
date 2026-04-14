import type { NonNullableOption, Option } from "@/components/ui/input-tag";

export type RunScope = "run-path" | "run-node";
export type FormData = Record<string, string>;

export type SourceSectionProps = {
  inputs: NonNullableOption[] | null;
  runScope: RunScope;
  initialSource?: string;
};

export type SourceFileProps = {
  inputs: NonNullableOption[] | null;
  scope: RunScope;
};

export type ScopeSectionProps = {
  selectedNode: Option | null;
  setSelectedNode: (node: Option | null) => void;
  scope: RunScope;
  setScope: (scope: RunScope) => void;
};

export type RunNodeSectionProps = Omit<ScopeSectionProps, "scope" | "setScope">;

export type ConfigurationVersion = {
  id: string;
  major: number;
  minor: number;
  patch: number;
  timestamp: string;
};

export type RunItem = {
  id: string;
  configId?: string;
  status: string;
  belongsToBatch?: boolean;
  isSingleNode?: boolean;
  isTest?: boolean;
  startTime: string;
  endTime?: string;
  executionTime?: string;
  configurationVersion?: ConfigurationVersion;
  data?: Record<string, string | string[]>;
};

export type VersionGroup = {
  version: string;
  versionTimestamp: string;
  runs: RunItem[];
};

export type RecentSamplesResponse = {
  items: RunItem[];
  totalCount?: number;
};

export type RecentSamplesSectionProps = {
  inputs: NonNullableOption[] | null;
  runScope: RunScope;
};

export type LoadFromDatasetProps = {
  inputs: NonNullableOption[] | null;
  scope: RunScope;
};

export type InputsSectionProps = {
  inputs: NonNullableOption[] | null;
  scope: RunScope;
};

export type InputRendererProps = {
  input: NonNullableOption;
  scope: RunScope;
};

export type FileInputRendererProps = {
  input: NonNullableOption;
  onChange?: (value: string[] | undefined) => void;
  defaultValue?: string;
};

export type ContainerWithLabelProps = {
  children: React.ReactNode;
  input: NonNullableOption;
};
