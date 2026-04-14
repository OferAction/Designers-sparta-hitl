import {
  ApproximateEqualsIcon,
  ArticleIcon,
  BracketsCurlyIcon,
  CrosshairSimpleIcon,
  EyeIcon,
  FileLockIcon,
  FileCodeIcon,
  FoldersIcon,
  FrameCornersIcon,
  PencilSimpleIcon,
  SelectionSlashIcon,
  ShapesIcon,
  CubeIcon,
} from "@phosphor-icons/react";

import {
  AggregatorIcon,
  ApiNodeIcon,
  ClusterIcon,
  CodeNodeIcon,
  ConditionIcon,
  DataLoaderIcon,
  DeduplicationIcon,
  EndNodeIcon,
  EvalConnectorIcon,
  FilterNodeIcon,
  GenOrModelIcon,
  IdentityNodeIcon,
  LLMIcon,
  LoopNodeIcon,
  OCRIcon,
  OutlookIcon,
  RegexIcon,
  SlackIcon,
  SplitterNodeIcon,
  StartNodeIcon,
  SubflowIcon,
  ZoomIcon,
} from "@/lib/icons";

export const NodeIconsMapping = {
  start: StartNodeIcon,
  startNodeIcon: StartNodeIcon,
  userInput: PencilSimpleIcon,
  metadataProcessor: ArticleIcon,
  dataset: FoldersIcon,
  regexBinaryClassifier: RegexIcon,
  ifelse: ConditionIcon,
  customCodeAgent: CodeNodeIcon,
  iterator: LoopNodeIcon,
  regexMultiLabelClassifier: RegexIcon,
  regexMultiClassClassifier: BracketsCurlyIcon,
  regexClusteringAgent: ClusterIcon,
  ocrAgent: OCRIcon,
  llmAgent: LLMIcon,
  filterAgent: FilterNodeIcon,
  deduplicationAgent: DeduplicationIcon,
  aggregator: AggregatorIcon,
  end: EndNodeIcon,
  formattingAgent: FileCodeIcon,
  YOLOAgent: CrosshairSimpleIcon,
  VITClassifier: EyeIcon,
  APIAgent: ApiNodeIcon,
  TrOCRAgent: FrameCornersIcon,
  mappingAgent: FileLockIcon,
  dataLoader: DataLoaderIcon,
  identity: IdentityNodeIcon,
  splitterAgent: SplitterNodeIcon,
  genOrModel: GenOrModelIcon,
  subflow: SubflowIcon,
  // Category types
  agents: CubeIcon,
  classifiers: SelectionSlashIcon,
  operators: ApproximateEqualsIcon,

  // plugins
  outlook: OutlookIcon,
  connector: EvalConnectorIcon,
  slack: SlackIcon,
  zoom: ZoomIcon,

  // Canvas types mapping - all unique canvasType values from your node data
  // These are extracted from the node templates data
  RegexAgent: RegexIcon,
  CodeAgent: CodeNodeIcon,
  OcrAgent: OCRIcon,
  LlmAgent: LLMIcon,
  ApiAgent: ApiNodeIcon,
  IdentityAgent: IdentityNodeIcon,
  GenorAgent: GenOrModelIcon,
};

export const NODE_ICONS_MAP = (value: string) => {
  return NodeIconsMapping[value as keyof typeof NodeIconsMapping] ?? ShapesIcon;
};

// Four canonical node groups and their display colors
export const NODE_GROUP_COLOR: Record<"Custom" | "Data Processing" | "Logic" | "Agents", string> = {
  Agents: "var(--nodes-agents)",
  Custom: "var(--nodes-custom)",
  "Data Processing": "var(--nodes-data-processing)",
  Logic: "var(--nodes-logic)",
};

// Map node names to one of the four groups for catalog grouping
export const NODE_CATEGORY_GROUP: Record<string, keyof typeof NODE_GROUP_COLOR> = {
  // agents
  llmAgent: "Agents",
  APIAgent: "Agents",
  regexBinaryClassifier: "Agents",
  regexMultiLabelClassifier: "Agents",
  identity: "Agents",
  genOrModel: "Agents",
  // logic
  iterator: "Logic",
  aggregator: "Logic",
  ifelse: "Logic",
  filterAgent: "Logic",
  // data processing
  ocrAgent: "Data Processing",
  deduplicationAgent: "Data Processing",
  splitterAgent: "Data Processing",
  regexMultiClassClassifier: "Data Processing",
  regexClusteringAgent: "Data Processing",
  dataLoader: "Data Processing",
  // custom
  customCodeAgent: "Custom",
};

export const NODE_CATEGORY_COLOR: Record<string, string> = {
  start: "var(--foreground)",
  end: "var(--foreground)",
  subflow: "var(--purple-foreground)",
  ...Object.fromEntries(Object.entries(NODE_CATEGORY_GROUP).map(([key, group]) => [key, NODE_GROUP_COLOR[group]])),
};

export const NODE_GROUP_BG_COLOR: Record<"Custom" | "Data Processing" | "Logic" | "Agents", string> = {
  Agents: "var(--nodes-success)",
  Custom: "var(--nodes-custom)",
  "Data Processing": "var(--nodes-data-processing)",
  Logic: "var(--nodes-logic)",
};

export const NODE_CATEGORY_BG_COLOR: Record<string, string> = {
  start: "var(--node-start-end-connector)",
  end: "var(--node-start-end-connector)",
  outlook: "var(--node-start-end-connector)",
  slack: "var(--node-start-end-connector)",
  zoom: "var(--node-start-end-connector)",
  subflow: "var(--node-subflow)",
  ...Object.fromEntries(Object.entries(NODE_CATEGORY_GROUP).map(([key, group]) => [key, NODE_GROUP_BG_COLOR[group]])),
  iterator: "transparent",
};

export const NODE_GROUP_ICON_COLOR: Record<"Custom" | "Data Processing" | "Logic" | "Agents", string> = {
  Agents: "var(--foreground)",
  Custom: "var(--foreground)",
  "Data Processing": "var(--foreground)",
  Logic: "var(--foreground)",
};
export const NODE_CATEGORY_ICON_COLOR: Record<string, string> = {
  start: "var(--foreground)",
  end: "var(--foreground)",
  subflow: "var(--purple-foreground)",
  ...Object.fromEntries(Object.entries(NODE_CATEGORY_GROUP).map(([key, group]) => [key, NODE_GROUP_ICON_COLOR[group]])),
};
