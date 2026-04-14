import { produce } from "immer";

import { NodeVariant, DataLoaderInputs } from "../types/BaseNodeTypes";
import { NonNullableOption as Option } from "@/components/ui/input-tag";
import { useSelectedNode } from "@/modules/flow/hooks";
import { useFlowStore } from "@/store";
import { genId } from "@/utils";

export default function useDataLoaderRightPanelInputs() {
  const onChange = useFlowStore((state) => state.onChange);
  const selectedNode = useSelectedNode<NodeVariant<"dataLoader">>();

  const syncOutputsWithInputs = (inputs: DataLoaderInputs[]) => {
    if (!selectedNode) return;

    const newOutputs = inputs.map((input) => ({
      id: input.id,
      key: input.key,
      type: input.type.value,
    }));

    // Save outputs to store
    onChange(selectedNode.id, "outputs", newOutputs);
  };

  const handleAddInput = () => {
    if (!selectedNode) return;
    const newInput = {
      id: genId(),
      key: "",
      type: {
        label: "File" as const,
        value: "File" as const,
      },
      value: {
        label: "",
        value: "",
      },
    };

    const newInputs = [...selectedNode.data.inputs, newInput];
    onChange(selectedNode.id, "inputs", newInputs);

    // Sync outputs immediately after adding input
    syncOutputsWithInputs(newInputs);
  };

  const onKeyChange = (inputId: string, value: string) => {
    if (!selectedNode) return;

    const newInputs = produce(selectedNode.data.inputs, (draft) => {
      const input = draft.find((input) => input.id === inputId);
      if (!input) return;
      input.key = value;
      input.type = input.type || { label: "File", value: "File" };
    });

    // Save inputs to store
    onChange(selectedNode.id, "inputs", newInputs);

    // Automatically sync outputs when input keys change
    syncOutputsWithInputs(newInputs);

    return newInputs;
  };

  const onValueChange = (inputId: string, value: Option) => {
    if (!selectedNode) return;
    const newInputs = produce(selectedNode.data.inputs, (draft) => {
      const input = draft.find((input) => input.id === inputId);
      if (!input) return;
      input.value = value ? value : { label: "", value: "" };
    });
    onChange(selectedNode.id, "inputs", newInputs);
  };

  const handleRemoveInputOutput = (inputId: string) => {
    if (!selectedNode) return;

    const newInputs = selectedNode.data.inputs.filter((input) => input.id !== inputId);

    // Save inputs first
    onChange(selectedNode.id, "inputs", newInputs);

    // Sync outputs after removing input
    syncOutputsWithInputs(newInputs);
  };

  const onOutputKeyChange = (inputs: DataLoaderInputs[]) => {
    syncOutputsWithInputs(inputs);
  };

  const onOutputTypeChange = (inputId: string) => {
    if (!selectedNode) return;

    // Update input type
    const newInputs = produce(selectedNode.data.inputs, (draft) => {
      const input = draft.find((input) => input.id === inputId);
      if (!input) return;
      input.type = { label: "File", value: "File" };
    });

    // Save inputs to store
    onChange(selectedNode.id, "inputs", newInputs);

    // Sync outputs with the updated inputs
    syncOutputsWithInputs(newInputs);
  };

  return {
    handleAddInput,
    handleRemoveInputOutput,
    onKeyChange,
    onValueChange,
    onOutputKeyChange,
    onOutputTypeChange,
    syncOutputsWithInputs,
  };
}
