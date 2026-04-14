import { useCallback } from "react";

import { produce } from "immer";

import useAncestorValueOptions from "@/modules/flow/hooks/useAncestorValueOptions";
import useNodeIOItem from "@/modules/flow/hooks/useNodeIOItem";

import NodeIOSection from "../shared/NodeIOSection";
import type { NodeInputItem, NodeVariantData } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

type IterableInputProps<N extends NodeVariantData<any, any>> = {
  selectedNode: N | undefined;
  itemsKey?: string;
  title?: string;
  type?: string;
  typeOptions?: Array<{ label: string; value: string }>;
  isTypeReadOnly?: boolean;
  placeholder?: string;
  items: NodeInputItem[];
  onTypeChange?: (newType: string) => void;
};

export default function IterableInput<N extends NodeVariantData<any, any>>({
  selectedNode,
  itemsKey = "items",
  title = "Iterable",
  typeOptions,
  isTypeReadOnly = true,
  placeholder = "Reference an iterable...",
  items: itemsProp,
  onTypeChange: onTypeChangeProp,
}: IterableInputProps<N>) {
  const selectedNodeId = selectedNode?.id;
  const onChange = useFlowStore((s) => s.onChange);
  const ancestorOptions = useAncestorValueOptions(selectedNodeId);

  const handleChange = useCallback(
    (selectedInput: NodeInputItem[]) => {
      if (!selectedNodeId) return;

      const currentInputs = (selectedNode?.data?.inputs as Record<string, Partial<NodeInputItem>>) || {};

      if (!selectedInput || selectedInput.length === 0) {
        const newInputs = produce(currentInputs, (draft: Record<string, Partial<NodeInputItem>>) => {
          if (!draft[itemsKey]) draft[itemsKey] = {};
          draft[itemsKey].value = { label: "", value: "" };
        });
        onChange(selectedNodeId, "inputs", newInputs);
        return;
      }

      const updatedItem = selectedInput[0];

      const newInputs = produce(currentInputs, (draft: Record<string, Partial<NodeInputItem>>) => {
        if (!draft[itemsKey]) draft[itemsKey] = {};

        if (updatedItem.value) {
          draft[itemsKey].value = {
            ...updatedItem.value,
            isReference: true,
          };
        }

        if (updatedItem.type) {
          draft[itemsKey].type = updatedItem.type;
          onTypeChangeProp?.(updatedItem.type);
        }
      });
      onChange(selectedNodeId, "inputs", newInputs);
    },
    [selectedNodeId, onChange, selectedNode?.data?.inputs, itemsKey, onTypeChangeProp]
  );

  const { treeRoots, onTypeChange, onValueChange } = useNodeIOItem({
    items: itemsProp,
    onChange: handleChange,
  });

  if (!selectedNode || !selectedNodeId) {
    return null;
  }

  return (
    <NodeIOSection
      title={title}
      roots={treeRoots}
      handlers={{
        onValueChange,
        onTypeChange,
      }}
      selectedNode={selectedNode}
      getItemProps={() => {
        return {
          readOnly: { key: true, type: isTypeReadOnly },
          hidden: { key: true, description: true, optional: true, type: false },
          placeholder: placeholder,
          variableInitialSymbol: "",
          typeOptions,
        };
      }}
      valueOptions={ancestorOptions}
    />
  );
}
