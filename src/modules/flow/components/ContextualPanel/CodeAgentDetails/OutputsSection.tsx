import { useCallback } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import useNodeIOItem from "@/modules/flow/hooks/useNodeIOItem";
import { useSelectedNode } from "@/modules/flow/hooks/useSelectedNode";

import { VALUE_TYPE_ITEMS_START } from "@/components/ui/input-tag/old-deprecated/InputTag/constants";
import { SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { IOSectionConfig, NodeIOSection } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { isPydanticOrhasPydanticParent } from "@/modules/flow/components/IO";
import { NodeOutput, NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

const config: IOSectionConfig = {
  title: "Outputs",
  headerActions: ({ handlers: { handleAddInput } }) =>
    handleAddInput && (
      <SectionTitleButton onClick={() => handleAddInput?.({ label: "String", value: "String" })}>
        <PlusIcon className="size-4" />
      </SectionTitleButton>
    ),
  getItemProps: (treeNode, ctx) => {
    const props: Record<string, unknown> = {
      hidden: { value: true },
      readOnly: {},
      allowChildren: (type: string) => {
        return /^List/.test(type) || type === "List" || type === "Object" || type === "Dict" || type === "Pydantic";
      },
      typeOptions: undefined,
    };

    if (isPydanticOrhasPydanticParent(treeNode, ctx.flatItems || [])) {
      const isItemItselfPydantic = treeNode.type === "Pydantic";
      Object.assign(props.hidden as object, { description: false, optional: isItemItselfPydantic });
      Object.assign(props.readOnly as object, { description: false, optional: isItemItselfPydantic });
    }

    if (!treeNode.parentId) {
      props.typeOptions = VALUE_TYPE_ITEMS_START;
    }

    return props;
  },
};

const OutputsSection = () => {
  const selectedNode = useSelectedNode() as NodeVariant<"agent", "customCodeAgent">;
  const selectedNodeOutputs = selectedNode?.data.outputs;
  const selectedNodeId = selectedNode?.id;
  const onChange = useFlowStore((state) => state.onChange);

  const handleChange = useCallback(
    (next: NodeOutput[]) => {
      if (!selectedNodeId) return;
      onChange(selectedNodeId, "outputs", next);
    },
    [selectedNodeId, onChange]
  );

  const {
    treeRoots,
    handleAddInput,
    onKeyChange,
    onDescriptionChange,
    onValueChange,
    onTypeChange,
    onOptionalToggle,
    onAddBelow,
    onAddChild,
    onRemove,
  } = useNodeIOItem<NodeOutput>({
    items: selectedNodeOutputs,
    onChange: handleChange,
    addTemporaryPlaceholder: true,
  });

  if (!selectedNode) return null;

  return (
    <NodeIOSection
      roots={treeRoots}
      selectedNode={selectedNode}
      flatItems={selectedNodeOutputs}
      tooltip="Define the outputs produced by this code agent."
      handlers={{
        onKeyChange,
        onDescriptionChange,
        onValueChange,
        onTypeChange,
        onOptionalToggle,
        onAddBelow,
        onAddChild,
        onRemove,
        handleAddInput,
      }}
      {...config}
    />
  );
};

export default OutputsSection;
