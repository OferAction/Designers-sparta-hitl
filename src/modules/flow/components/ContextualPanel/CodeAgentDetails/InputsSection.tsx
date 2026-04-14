import { PlusIcon } from "@phosphor-icons/react";

import useAncestorValueOptions from "@/modules/flow/hooks/useAncestorValueOptions";
import useNodeIOItem from "@/modules/flow/hooks/useNodeIOItem";

import { SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import NodeIOSection, { IOSectionConfig } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeInputItem, NodeVariant } from "@/modules/flow/types/BaseNodeTypes";
import { useFlowStore } from "@/store";

const config: IOSectionConfig = {
  title: "Arguments",
  headerActions: ({ handlers: { handleAddInput } }) =>
    handleAddInput && (
      <SectionTitleButton onClick={() => handleAddInput?.({ label: "String", value: "String" })}>
        <PlusIcon />
      </SectionTitleButton>
    ),
};

export const InputsSection = () => {
  const selectedNode = useSelectedNode() as NodeVariant<"agent", "customCodeAgent">;
  const selectedNodeId = selectedNode?.id;
  const onChange = useFlowStore((state) => state.onChange);

  const handleChange = (next: NodeInputItem[]) => {
    if (!selectedNodeId) return;
    onChange(selectedNodeId, "inputs.input_vars", next);
  };

  const { treeRoots, handleAddInput, onKeyChange, onDescriptionChange, onValueChange, onTypeChange, onAddBelow, onAddChild, onRemove } =
    useNodeIOItem({
      items: selectedNode?.data.inputs.input_vars,
      onChange: handleChange,
      addTemporaryPlaceholder: true,
    });

  const valueOptions = useAncestorValueOptions(selectedNode?.id);

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
