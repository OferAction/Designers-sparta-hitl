import { ReactNode } from "react";

import AggregatorOutputs from "./aggregator/AggregatorOutputs";
import ApiAgent from "./apiAgent/ApiAgent";
import CodeAgentConfiguration from "./CodeAgentDetails";
import { ConditionalDetails } from "./ConditionalDetails";
import OutlookDetails from "./connectors/OutlookDetails";
import { DataLoaderNodeDetails } from "./DataLoader";
import { DeduplicationAgentConfiguration } from "./DeduplicationAgentDetails";
import { EndNodeDetails } from "./EndNode/EndNodeDetails";
import FilterAgentPanel from "./FilterAgent/FilterAgentPanel";
import { GenOrModelConfiguration } from "./GenOrModels";
import { IdentityNodeDetails } from "./IdentityAgent";
import { IteratorNodeDetails } from "./Iterator";
import LLMAgentPanel from "./LLMDetails/LLMAgentPanel";
import { OCRAgentConfiguration } from "./OCRAgent";
import { RegexBinaryClassifierDetails } from "./RegexClassifiers/RegexBinaryClassifierDetails";
import { RegexClusteringDetails } from "./RegexClassifiers/RegexClustering";
import { RegexMultiClassClassifierDetails } from "./RegexClassifiers/RegexMultiClassClassifier";
import { SplitterAgent } from "./SplitterAgent";
import { StartNodeDetails } from "./StartNode";
import { SubflowDetails } from "./Subflow";
import { useSelectedNode } from "@/modules/flow/hooks";
import { AgentNode, ConnectorNode, NodeTypes } from "@/modules/flow/types/BaseNodeTypes";

const typeBasedComponents: Partial<Record<NodeTypes, ReactNode>> = {
  // Non-agent nodes
  ifelse: <ConditionalDetails />,
  iterator: <IteratorNodeDetails />,
  aggregator: <AggregatorOutputs />,
  end: <EndNodeDetails />,
  start: <StartNodeDetails />,
  subflow: <SubflowDetails />,
  identity: <IdentityNodeDetails />,
  metadataProcessor: null,
  dataLoader: <DataLoaderNodeDetails />,
};

// agent types
const agentHandlers: Record<AgentNode, ReactNode> = {
  regexBinaryClassifier: <RegexBinaryClassifierDetails />,
  regexMultiLabelClassifier: null,
  regexMultiClassClassifier: <RegexMultiClassClassifierDetails />,
  regexClusteringAgent: <RegexClusteringDetails />,
  ocrAgent: <OCRAgentConfiguration />,
  formattingAgent: null,
  mappingAgent: null,
  llmAgent: <LLMAgentPanel />,
  filterAgent: <FilterAgentPanel />,
  splitterAgent: <SplitterAgent />,
  customCodeAgent: <CodeAgentConfiguration />,
  APIAgent: <ApiAgent />,
  TrOCRAgent: null,
  VITClassifier: null,
  YOLOAgent: null,
  genOrModel: <GenOrModelConfiguration />,
  deduplicationAgent: <DeduplicationAgentConfiguration />,
};
// connectros type

const connectorHandlers: Record<ConnectorNode, ReactNode> = {
  outlook: <OutlookDetails />,
  slack: null,
  zoom: null,
};

export const NodeDetails = () => {
  const node = useSelectedNode();
  if (!node) return null;

  if (node.type && node.type !== "agent" && node.type !== "connector" && typeBasedComponents[node.type as keyof typeof typeBasedComponents]) {
    return typeBasedComponents[node.type as keyof typeof typeBasedComponents];
  } else if (node.type === "agent" && node.data?.name) {
    const agentType = node.data.name as AgentNode;
    if (agentType in agentHandlers && agentHandlers[agentType]) {
      return agentHandlers[agentType];
    }
  } else if (node.type && node.type === "connector" && node.data?.name) {
    const connectorType = node.data.name as ConnectorNode;
    if (connectorType in connectorHandlers && connectorHandlers[connectorType]) {
      return connectorHandlers[connectorType];
    }
  }
  return null;
};
