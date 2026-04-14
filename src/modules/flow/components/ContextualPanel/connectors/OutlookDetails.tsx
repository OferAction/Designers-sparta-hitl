import { SlidersHorizontalIcon } from "@phosphor-icons/react";

import ConnectAccount from "./components/ConnectAccount";
import GetEmailAdvancedParametersModal from "./GetEmailAdvancedParametersModal";
import GetEmailPanel from "./GetEmailPanel";
import SendEmailAdvancedParametersModal from "./SendEmailAdvancedParameters";
import SendEmailPanel from "./SendEmailPanel";
import { Option } from "@/components/ui/input-tag";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle, SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant } from "@/modules/flow/types";
import { useDialogStoreActions, useFlowStore } from "@/store";

function OutlookDetails({ nodeId, systemVariables, isExceptionConnector = false }: { nodeId?: string; systemVariables?: Option[], isExceptionConnector?: boolean }) {
  const onChange = useFlowStore((state) => state.onChange);
  const nodes = useFlowStore((state) => state.nodes);
  const selectedFromStore = useSelectedNode<NodeVariant<"connector", "outlook">>();
  const selectedNode = nodeId ? (nodes.find((n) => n.id === nodeId) as NodeVariant<"connector", "outlook"> | undefined) : selectedFromStore;
  const action = selectedNode?.data.inputs.find((input) => input.key === "action");
  const { openDialog } = useDialogStoreActions();

  function openAdvancedParams() {
    if (action?.value?.value == "GET") {
      openDialog(({ id, onClose }) => <GetEmailAdvancedParametersModal id={id} onClose={onClose} nodeId={selectedNode?.id ?? nodeId} />);
    } else {
      openDialog(({ id, onClose }) => <SendEmailAdvancedParametersModal id={id} onClose={onClose} nodeId={selectedNode?.id ?? nodeId} />);
    }
  }

  function handleChange(value: string) {
    if (selectedNode?.id) {
      const current = Array.isArray(selectedNode.data.inputs) ? selectedNode.data.inputs : [];
      const newInputs = current.map((it) => (it.key === "action" ? { ...it, value: { label: value, value } } : it));
      onChange(selectedNode.id, "inputs", newInputs);

      // Update outputs based on action type
      const currentOutputs = selectedNode.data.outputs || [];
      let newOutputs = currentOutputs;

      if (value === "GET") {
        const hasDataOutput = currentOutputs.some((output) => output.id === "data");
        if (!hasDataOutput) {
          newOutputs = [
            ...currentOutputs,
            {
              id: "data",
              key: "data",
              type: "Object",
              description: "List of retrieved emails",
            },
          ];
        }
      } else {
        newOutputs = currentOutputs.filter((output) => output.id !== "data");
      }

      onChange(selectedNode.id, "outputs", newOutputs);
    }
  }
  return (
    <>
      <ConnectAccount nodeId={selectedNode?.id ?? nodeId} />
      <SectionContainer>
        <SectionTitle title="Action" />
        <Select onValueChange={handleChange} value={action?.value.value || ""}>
          <SelectTrigger className="bg-background">
            <SelectValue placeholder="When receive new emails" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="SEND">Send email</SelectItem>
            {!isExceptionConnector && <SelectItem value="GET">Get emails</SelectItem>}
          </SelectContent>
        </Select>
      </SectionContainer>
      <SectionContainer>
        <SectionTitle title="Configuration parameters">
          <SectionTitleButton onClick={openAdvancedParams}>
            <SlidersHorizontalIcon className="size-4" />
          </SectionTitleButton>
        </SectionTitle>
        {action?.value.value === "GET" && <GetEmailPanel nodeId={selectedNode?.id ?? nodeId} />}
        {action?.value.value === "SEND" && <SendEmailPanel showRestoreDefault={isExceptionConnector} nodeId={selectedNode?.id ?? nodeId} systemVariables={systemVariables} />}
      </SectionContainer>
    </>
  );
}

export default OutlookDetails;
