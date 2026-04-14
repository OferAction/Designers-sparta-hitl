import { useSelectedNode } from "@/modules/flow/hooks";
import { EmailConnectorUser } from "@/modules/flow/services/connectors/types";
import { NodeVariant, OutlookInputType } from "@/modules/flow/types";
import { useFlowStore } from "@/store";
import { genId } from "@/utils";

export default function useSetActiveAccount(nodeId?: string) {
  const nodes = useFlowStore((state) => state.nodes);
  const selectedFromStore = useSelectedNode<NodeVariant<"connector", "outlook">>();
  const selectedNode = nodeId ? (nodes.find((n) => n.id === nodeId) as NodeVariant<"connector", "outlook"> | undefined) : selectedFromStore;
  const onChange = useFlowStore((state) => state.onChange);
  function handleActiveAccount(user: EmailConnectorUser) {
    if (!selectedNode?.id) return;
    const current = Array.isArray(selectedNode.data.inputs) ? selectedNode.data.inputs : [];

    let found = false;
    const newInputs = current.map((input: OutlookInputType) => {
      if (input.key === "userId") {
        found = true;
        return { ...input, value: { label: user.userDisplayName, value: user.userId } };
      }
      return input;
    });

    if (!found) {
      newInputs.push({
        id: `userId_${genId()}`,
        key: "userId",
        type: "String",
        value: { label: user.userDisplayName, value: user.userId },
      });
    }

    onChange(selectedNode.id, "inputs", newInputs);
  }

  return { handleActiveAccount };
}
