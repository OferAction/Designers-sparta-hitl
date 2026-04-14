import { useCallback } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import { useAncestorValueOptions } from "@/modules/flow/hooks/useAncestorValueOptions";
import useNodeIOItem from "@/modules/flow/hooks/useNodeIOItem";
import { useSelectedNode } from "@/modules/flow/hooks/useSelectedNode";

import StartNodeStartEvent from "./Triggers/StartNodeStartEvent";
import { VALUE_TYPE_ITEMS_START } from "@/components/ui/input-tag/old-deprecated/InputTag/constants";
import { SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { IOSectionConfig, NodeIOSection } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { isPydanticOrhasPydanticParent } from "@/modules/flow/components/IO";
import type { NodeInputItem, NodeOutput, NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

const config: IOSectionConfig = {
  title: "Workflow Inputs",
  headerActions: ({ handlers: { handleAddInput } }) =>
    handleAddInput && (
      <SectionTitleButton onClick={() => handleAddInput?.({ label: "String", value: "String" })}>
        <PlusIcon />
      </SectionTitleButton>
    ),
  getItemProps: (treeNode, ctx) => {
    const props: Record<string, any> = {
      hidden: { value: true },
      readOnly: {},
      allowChildren: (type: string) => {
        return /^List/.test(type) || type === "List" || type === "Object" || type === "Dict" || type === "Pydantic";
      },
      typeOptions: undefined,
    };
    if (isPydanticOrhasPydanticParent(treeNode, ctx.flatItems || [])) {
      const isItemItselfPydantic = treeNode.type === "Pydantic";
      Object.assign(props.hidden, { description: false, optional: isItemItselfPydantic });
      Object.assign(props.readOnly, { description: false, optional: isItemItselfPydantic });
    }
    if (!treeNode.parentId) {
      props.typeOptions = VALUE_TYPE_ITEMS_START;
      // Make Outlook trigger inputs read-only
      if (treeNode.readOnly) {
        Object.assign(props.readOnly, { key: true });
      }
    }

    return props;
  },
};

export const StartNodeDetails = () => {
  const onChange = useFlowStore((state) => state.onChange);
  const selectedNode = useSelectedNode<NodeVariant<"start">>();

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

  const {
    treeRoots,
    handleAddInput,
    onKeyChange,
    onDescriptionChange,
    onValueChange,
    onTypeChange,
    onAddBelow,
    onAddChild,
    onRemove,
    onOptionalToggle,
  } = useNodeIOItem({
    items: selectedNode?.data.inputs,
    onChange: handleChange,
    addTemporaryPlaceholder: true,
  });

  const valueOptions = useAncestorValueOptions(selectedNode?.id);

  if (!selectedNode) return null;

  return (
    <>
      <NodeIOSection
        roots={treeRoots}
        valueOptions={valueOptions}
        selectedNode={selectedNode}
        flatItems={selectedNode.data.inputs}
        handlers={{
          onKeyChange,
          onDescriptionChange,
          onValueChange,
          onTypeChange,
          onAddBelow,
          onAddChild,
          onRemove,
          handleAddInput,
          onOptionalToggle,
        }}
        {...config}
      />
      <StartNodeStartEvent />
    </>
  );
};

export default StartNodeDetails;
