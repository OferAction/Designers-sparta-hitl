import { ModelParametersDialog } from "./../LLMDetails/ModelParametersDialog";
import { AgentNodeData, NodeVariant } from "../../../types/BaseNodeTypes";
import { InputLabel } from "@/components/common/InputLabel";
import { useSelectedNode } from "@/modules/flow/hooks";

export default function LLMHeaderConfig() {
  const selectedNode = useSelectedNode<NodeVariant<"agent", "llmAgent">>();

  const getModelButtonText = () => {
    if (!selectedNode) {
      return "Select Model";
    }

    const nodeData = selectedNode.data as AgentNodeData;

    const modelParams = nodeData.inputs?.model_parameters;

    if (!modelParams?.model) {
      return "Select Model";
    }

    return modelParams.model;
  };
  return (
    <div>
      {selectedNode && (
        <ModelParametersDialog>
          <InputLabel variant="emphasized" value={getModelButtonText()} size="sm" />
        </ModelParametersDialog>
      )}
    </div>
  );
}
