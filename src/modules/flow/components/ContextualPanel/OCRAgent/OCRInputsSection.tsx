import { useCallback, useMemo } from "react";

import useAncestorValueOptions from "@/modules/flow/hooks/useAncestorValueOptions";
import useNodeIOItem from "@/modules/flow/hooks/useNodeIOItem";

import { OCRHeaderConfig } from "@/modules/flow/components/ContextualPanel/OCRAgent/OCRHeaderConfig";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import NodeIOSection from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeInputItem, NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

export const OCRInputsSection = () => {
  const selectedNode = useSelectedNode<NodeVariant<"agent", "ocrAgent">>();
  const selectedNodeId = selectedNode?.id;
  const onChange = useFlowStore((state) => state.onChange);
  const options = useAncestorValueOptions(selectedNodeId || "");

  const handleValueChange = useCallback(
    (selectedInput: NodeInputItem[]) => {
      if (!selectedNodeId) return;

      const currentInputs = selectedNode?.data?.inputs || {};

      if (!selectedInput || selectedInput.length === 0) {
        const newInputs = {
          ...currentInputs,
          value: null,
        };
        onChange(selectedNodeId, "inputs", newInputs);
        return;
      }

      const newOption = selectedInput[0];

      const newInputs = {
        ...currentInputs,
        value: newOption.value,
      };
      onChange(selectedNodeId, "inputs", newInputs);
    },
    [selectedNodeId, onChange, selectedNode?.data?.inputs]
  );

  const currentValue = selectedNode?.data?.inputs?.value;

  const items: NodeInputItem[] = useMemo(() => {
    return [
      {
        id: "image",
        key: "image",
        type: "File",
        value: currentValue || { label: "", value: "" },
      },
    ];
  }, [currentValue]);

  const { treeRoots, onValueChange } = useNodeIOItem({
    items,
    onChange: handleValueChange,
  });

  if (!selectedNode || !selectedNodeId) {
    return null;
  }

  return (
    <>
      <SectionContainer>
        <SectionTitle title="Model" />
        <OCRHeaderConfig />
      </SectionContainer>
      <NodeIOSection
        title="Inputs"
        roots={treeRoots}
        handlers={{
          onValueChange,
        }}
        selectedNode={selectedNode}
        getItemProps={() => {
          return {
            readOnly: { key: true, type: true },
          };
        }}
        valueOptions={options}
      />
    </>
  );
};
