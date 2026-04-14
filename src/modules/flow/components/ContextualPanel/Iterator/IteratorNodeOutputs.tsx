import { useMemo, useCallback } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import useNodeIOItem from "@/modules/flow/hooks/useNodeIOItem";

import { SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { IOSectionConfig, NodeIOSection } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { useSelectedNode } from "@/modules/flow/hooks";
import type { NodeOutput } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

const outputsConfig: IOSectionConfig = {
  title: "Outputs",
  headerActions: ({ handlers: { handleAddInput }, selectedNode }) => {
    const isEditableOutputs = selectedNode?.data?.name ? ["customCodeAgent"].includes(selectedNode.data.name) : false;
    if (!isEditableOutputs) return null;
    return (
      handleAddInput && (
        <SectionTitleButton onClick={() => handleAddInput?.({ label: "String", value: "String" })}>
          <PlusIcon />
        </SectionTitleButton>
      )
    );
  },
  getItemProps: (node, ctx) => {
    // TODO: encode this into the agent templates
    const isEditableOutputs = ctx.selectedNode?.data?.name ? ["customCodeAgent"].includes(ctx.selectedNode.data.name) : false;

    return {
      hidden: { value: true, description: !node.description },
      readOnly: {
        key: node.readOnly ?? !isEditableOutputs,
        type: node.readOnly ?? !isEditableOutputs,
      },
      onAddBelow: node.readOnly || !isEditableOutputs ? undefined : ctx.handlers.onAddBelow,
      onAddChild: node.readOnly || !isEditableOutputs ? undefined : ctx.handlers.onAddChild,
      onRemove: node.readOnly || !isEditableOutputs ? undefined : ctx.handlers.onRemove,
    };
  },
};
export function IteratorNodeOutputs() {
  const selectedNode = useSelectedNode();
  const onChange = useFlowStore((store) => store.onChange);

  const { name } = selectedNode?.data || {};
  // Update node outputs in the store
  const handleOutputsChange = useCallback(
    (newOutputs: NodeOutput[]) => {
      if (!selectedNode?.id) return;
      onChange(selectedNode.id, "outputs", newOutputs);
    },
    [onChange, selectedNode?.id]
  );
  // Determine if outputs are editable for this node type
  const isEditableOutputs = useMemo(() => {
    const editableTypes = ["customCodeAgent"];
    return name ? editableTypes.includes(name) : false;
  }, [name]);
  const { treeRoots, handleAddInput, onKeyChange, onDescriptionChange, onTypeChange, onAddBelow, onAddChild, onRemove } = useNodeIOItem({
    items: selectedNode?.data?.outputs.filter((output: NodeOutput) => output.sourceNodeId === selectedNode.id || !output.sourceNodeId) || [],
    onChange: handleOutputsChange,
    addTemporaryPlaceholder: isEditableOutputs,
  });

  return (
    <NodeIOSection
      roots={treeRoots}
      valueOptions={[]}
      selectedNode={selectedNode!}
      handlers={{
        onKeyChange,
        onDescriptionChange,
        // onValueChange is intentionally not provided for outputs
        onTypeChange,
        onAddBelow,
        onAddChild,
        onRemove,
        handleAddInput,
      }}
      {...outputsConfig}
    />
  );
}

export default IteratorNodeOutputs;
