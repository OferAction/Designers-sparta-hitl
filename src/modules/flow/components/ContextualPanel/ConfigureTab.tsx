import { DefaultFlowConfigurationDetails } from "./DefaultFlowConfigurationDetails";
import RightPanelAfterExecution from "./RightPanelAfterExecution";
import { NodeDetails } from "./RightPanelNodeConfigurationDetails";
import RightPanelOutputs from "./RightPanelOutputs";
import RightPanelRules from "./RightPanelRules";
import { useSelectedNode } from "../../hooks";

export function ConfigureTab() {
  const selectedNode = useSelectedNode();
  const { outputs = [] } = selectedNode?.data || {};
  const isEnd = selectedNode?.type === "end";

  return (
    <div className="flex flex-col h-full">
      {selectedNode ? (
        <>
          <NodeDetails />
          <RightPanelOutputs outputs={outputs} />
          {!isEnd && <RightPanelRules />}
          {!isEnd && <RightPanelAfterExecution />}
        </>
      ) : (
        <DefaultFlowConfigurationDetails />
      )}
    </div>
  );
}
