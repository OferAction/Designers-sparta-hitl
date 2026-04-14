import { produce } from "immer";

import { useSelectedNode } from "@/modules/flow/hooks/useSelectedNode";

import IterableInput from "../shared/IterableInput";
import { NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

export default function IterableSection() {
  const selectedNode = useSelectedNode<NodeVariant<"agent", "filterAgent">>();
  const onChange = useFlowStore((state) => state.onChange);

  const handleIterableTypeChange = (newType: string) => {
    if (!selectedNode) return;

    const newOutputs = produce(selectedNode.data.outputs, (draft) => {
      const filteredOutput = draft.find((o) => o.key === "filtered_iterable");
      if (filteredOutput) {
        filteredOutput.type = newType;
      }
    });

    onChange(selectedNode.id, "outputs", newOutputs);
  };

  return (
    <IterableInput
      selectedNode={selectedNode}
      items={selectedNode?.data?.inputs?.iterable ? [selectedNode.data.inputs.iterable] : []}
      itemsKey="iterable"
      title="Iterable"
      typeOptions={[
        { label: "List", value: "List" },
        { label: "Object", value: "Object" },
      ]}
      isTypeReadOnly={false}
      onTypeChange={handleIterableTypeChange}
    />
  );
}
