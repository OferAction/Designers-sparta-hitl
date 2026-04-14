import IterableInput from "../../shared/IterableInput";
import { RegexClassInputs } from "../SharedComponents/RegexClassInputs";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant, RegexClass } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

const InputsConfigure = () => {
  const selectedNode = useSelectedNode<NodeVariant<"agent", "regexMultiClassClassifier">>();
  const onChange = useFlowStore((s) => s.onChange);
  const inputs = selectedNode?.data?.inputs?.classes || [];
  const iterableValue = selectedNode?.data?.inputs?.iterable?.value;

  const handleUpdate = (classes: RegexClass[]) => {
    if (!selectedNode) return;
    onChange(selectedNode.id, "inputs", {
      ...selectedNode.data.inputs,
      classes,
    });
  };

  if (!selectedNode) return null;

  return (
    <>
      <IterableInput
        selectedNode={selectedNode}
        itemsKey="iterable"
        title="Iterable"
        items={[
          {
            id: "iterable",
            key: "iterable",
            type: selectedNode?.data?.inputs?.iterable?.type,
            value: iterableValue || { label: "", value: "" },
          },
        ]}
      />
      <RegexClassInputs
        selectedNodeId={selectedNode.id}
        inputs={inputs}
        onUpdate={handleUpdate}
        title="Classification Classes"
        tooltip="Define the class patterns for multi-class classification."
        errorTooltip="Pattern required. Please define regex for this class."
        placeholder="Add class name"
      />
    </>
  );
};

export default InputsConfigure;
