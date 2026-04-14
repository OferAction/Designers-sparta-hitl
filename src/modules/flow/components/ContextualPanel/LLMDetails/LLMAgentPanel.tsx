import { useMemo } from "react";

import LLMInstructions from "./LLMInstructions";
import LLMHeaderConfig from "@/modules/flow/components/ContextualPanel/LLMDetails/LLMHeaderConfig";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { DynamicFieldValue } from "@/modules/flow/components/IO/DynamicField/types";
import { useSelectedNode } from "@/modules/flow/hooks";
import { AgentNodeData, Message, NodeVariant } from "@/modules/flow/types/BaseNodeTypes";
import { useFlowStore } from "@/store";
import { genId } from "@/utils";

const isDynamicFieldValue = (value: any): value is DynamicFieldValue => {
  return typeof value === "string" || (typeof value === "object" && value !== null);
};

export const LLMAgentPanel = () => {
  const selectedNode = useSelectedNode<NodeVariant<"agent", "llmAgent">>();
  const onChange = useFlowStore((state) => state.onChange);
  const defaultMessages = useMemo<Message[]>(() => [{ id: `msg_${genId()}`, role: "user", content: "" }], []);

  if (!selectedNode) return null;
  const nodeData = selectedNode.data as AgentNodeData;

  const systemPrompt = isDynamicFieldValue(nodeData.inputs?.system_prompt) ? nodeData.inputs?.system_prompt : "";
  const messages: Message[] = nodeData.inputs?.messages || [];
  const displayedMessages = messages.length === 0 ? defaultMessages : messages;

  const handleSystemPromptChange = (value: DynamicFieldValue) => {
    onChange(selectedNode.id, "inputs", { ...nodeData.inputs, system_prompt: value });
  };

  const handleMessagesChange = (updatedMessages: Message[]) => {
    onChange(selectedNode.id, "inputs", { ...nodeData.inputs, messages: updatedMessages });
  };

  return (
    <>
      <SectionContainer>
        <SectionTitle title="Model" />
        <LLMHeaderConfig />
      </SectionContainer>
      <LLMInstructions
        systemPrompt={systemPrompt}
        messages={displayedMessages}
        onSystemPromptChange={handleSystemPromptChange}
        onAddMessage={handleMessagesChange}
      />
    </>
  );
};

export default LLMAgentPanel;
