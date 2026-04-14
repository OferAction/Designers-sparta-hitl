import { useCallback } from "react";

import IterableInput from "../../shared/IterableInput";
import { RegexClassInputs } from "../SharedComponents/RegexClassInputs";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant, RegexClass } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

const InputsConfigure = () => {
  const selectedNode = useSelectedNode() as NodeVariant<"agent", "regexClusteringAgent">;
  const onChange = useFlowStore((s) => s.onChange);
  const inputs = selectedNode?.data?.inputs?.classes || [];
  const iterableValue = selectedNode?.data?.inputs?.iterable?.value;

  const handleIterableChange = useCallback(
    (newType: string) => {
      if (!selectedNode) return;

      // Update the unclustered output type to match the iterable input type
      const outputs = selectedNode.data.outputs;
      const updatedOutputs = outputs.map((output: any) => {
        if (output.id === "unclustered") {
          return { ...output, type: newType };
        }
        return output;
      });

      onChange(selectedNode.id, "outputs", updatedOutputs);
    },
    [selectedNode, onChange]
  );

  const handleUpdate = useCallback(
    (classes: RegexClass[], inputId?: string) => {
      if (!selectedNode) return;

      onChange(selectedNode.id, "inputs", {
        ...selectedNode.data.inputs,
        classes,
      });

      const outputs = selectedNode.data.outputs;
      const classIds = new Set(classes.map((c) => c.id));

      const fixedOutputs = outputs.filter((output) => !classIds.has(output.id) && output.id !== inputId);

      const classOutputs = classes.map((input) => ({
        id: input.id,
        key: input.key,
        type: "List",
      }));

      const newOutputs = [...fixedOutputs, ...classOutputs];

      onChange(selectedNode.id, "outputs", newOutputs);
    },
    [selectedNode, onChange]
  );

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
            type: selectedNode?.data?.inputs?.iterable?.type || "",
            value: iterableValue || { label: "", value: "" },
          },
        ]}
        onTypeChange={handleIterableChange}
      />
      <RegexClassInputs
        selectedNodeId={selectedNode.id}
        inputs={inputs}
        onUpdate={handleUpdate}
        title="Key Definition"
        tooltip="Define the key patterns and their associated regex for clustering."
        errorTooltip="Pattern required. Please define regex for this key"
        placeholder="Add key name"
      />
    </>
  );
};

export default InputsConfigure;
