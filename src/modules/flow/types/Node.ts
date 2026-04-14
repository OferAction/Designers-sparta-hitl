// import { Node as FlowNode } from "@xyflow/react";
// import { LucideIcon } from "lucide-react";

// import { NodeTypes } from "./BaseNodeTypes";
// import {
//   AggregatorNodeData,
//   ConditionalOperatorNodeData,
//   AgentNodeData,
//   EndNodeData,
//   IterationNodeData,
//   NodeData,
//   StartNodeData,
//   UserInputNodeData,
// } from "@/modules/flow/types/NodeData";

// export interface NodeOutputInterface {
//   label?: string;
//   type?: {
//     label?: string;
//   };
// }

// export interface NodeAncestors {
//   source: {
//     node_id: string;
//     title: string;
//     node_type?: string;
//     parentId?: string;
//   };
//   outputs: NodeOutputInterface[];
// }

// export type CanvasType = "agent" | "iteration" | "conditionalOperator" | "start" | "end" | "userInput" | "aggregator";
// export type AgentType =
//   | "regexBinaryClassifier"
//   | "regexMultiLabelClassifier"
//   | "regexMultiClassClassifier"
//   | "ocrAgent"
//   | "formattingAgent"
//   | "mappingAgent"
//   | "llmAgent"
//   | "customCodeAgent"
//   | "APIAgent"
//   | "TrOCRAgent"
//   | "VITClassifier"
//   | "YOLOAgent";

// export type NodeType =
//   | "start"
//   | "end"
//   | "userInput"
//   | "conditionalOperator"
//   | "iteration"
//   | "aggregator"
//   | "dataLoader"
//   | "metadataProcessor"
//   | AgentType;

// export type BaseNode<T extends CanvasType, D extends NodeData, NT = T extends NodeType ? T : never> = FlowNode<D> & {
//   id: string;
//   isConnectable?: boolean;
//   nodeType: NT extends never ? T : NT;
//   type: string;
//   selected?: boolean;
//   children?: React.ReactNode;
//   width?: number;
//   customIcon?: LucideIcon | React.ElementType;
//   data: D & { canvasType: T; icon: NT extends never ? T : NT };
// };

// export type StartNode = BaseNode<"start", StartNodeData>;
// export type EndNode = BaseNode<"end", EndNodeData>;
// export type AgentNode = BaseNode<"agent", AgentNodeData, AgentType>;
// export type UserInputNode = BaseNode<"userInput", UserInputNodeData>;
// export type IterationNode = BaseNode<"iteration", IterationNodeData>;
// export type ConditionalOperatorNode = BaseNode<"conditionalOperator", ConditionalOperatorNodeData>;
// export type AggregatorNode = BaseNode<"aggregator", AggregatorNodeData>;

// // export type Node = StartNode | EndNode | AgentNode | UserInputNode | IterationNode | ConditionalOperatorNode | AggregatorNode;

// // export const isAgentNode = (node: Node): node is AgentNode | IterationNode => {
// //   const agentNodesType: CanvasType[] = ["agent", "iteration"];
// //   return agentNodesType.includes(node.data.canvasType);
// // };

// export type FlowConfiguration = Partial<Record<NodeTypes, Node>>;
