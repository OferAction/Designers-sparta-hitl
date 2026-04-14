import { useCallback } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import { useAncestorValueOptions } from "@/modules/flow/hooks/useAncestorValueOptions";
import useNodeIOItem from "@/modules/flow/hooks/useNodeIOItem";

import { SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { IOSectionConfig, NodeIOSection } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { useSelectedNode } from "@/modules/flow/hooks";
import type { NodeInputItem, NodeOutput, NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

const config: IOSectionConfig = {
  title: "Create variable",
  headerActions: ({ handlers: { handleAddInput } }) =>
    handleAddInput && (
      <SectionTitleButton onClick={() => handleAddInput?.({ label: "String", value: "String" })}>
        <PlusIcon />
      </SectionTitleButton>
    ),
};

export const IdentityNodeDetails = () => {
  const onChange = useFlowStore((state) => state.onChange);
  const selectedNode = useSelectedNode<NodeVariant<"identity">>();

  const handleChange = useCallback(
    (next: NodeInputItem[]) => {
      if (!selectedNode) return;
      onChange(selectedNode.id, "inputs", next);
      const nextOutputs: NodeOutput[] = next.map((i) => {
        const { value: _value, ...output } = i;
        return { ...output, type: output.type || "String" };
      });
      onChange(selectedNode.id, "outputs", nextOutputs);
    },
    [onChange, selectedNode]
  );

  const { treeRoots, handleAddInput, onKeyChange, onDescriptionChange, onValueChange, onTypeChange, onAddBelow, onAddChild, onRemove } =
    useNodeIOItem({
      items: selectedNode?.data.inputs,
      onChange: handleChange,
      addTemporaryPlaceholder: true,
    });

  const valueOptions = useAncestorValueOptions(selectedNode?.id);

  if (!selectedNode) return null;
  return (
    <NodeIOSection
      roots={treeRoots}
      valueOptions={valueOptions}
      selectedNode={selectedNode}
      handlers={{
        onKeyChange,
        onDescriptionChange,
        onValueChange,
        onTypeChange,
        onAddBelow,
        onAddChild,
        onRemove,
        handleAddInput,
      }}
      {...config}
    />
  );
};

export default IdentityNodeDetails;
