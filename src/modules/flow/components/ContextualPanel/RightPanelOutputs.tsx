import { useMemo, useCallback } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import useNodeIOItem from "@/modules/flow/hooks/useNodeIOItem";

import { IteratorNodeOutputs } from "./Iterator";
import { OutputResponseFormat } from "./LLMDetails/OutputResponseFormat";
import { VALUE_TYPE_ITEMS_START } from "@/components/ui/input-tag/old-deprecated/InputTag/constants";
import { SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { IOSectionConfig, NodeIOSection } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { isPydanticOrhasPydanticParent } from "@/modules/flow/components/IO";
import { useSelectedNode } from "@/modules/flow/hooks";
import type { NodeOutput } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

type Props = {
  outputs: NodeOutput[];
};

// TODO: the agent templates should control this behavior
const typeBasedComponents = {
  ifelse: null,
  iterator: <IteratorNodeOutputs />,
  aggregator: null,
  start: null,
  end: null,
  identity: null,
  splitterAgent: null,
  dataLoader: null,
  metadataProcessor: null,
  llmAgent: <OutputResponseFormat />,
};

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

    const props: Record<string, unknown> = {
      hidden: { value: true, description: !node.description },
      readOnly: {
        key: node.readOnly ?? !isEditableOutputs,
        type: node.readOnly ?? !isEditableOutputs,
      },
      onAddBelow: node.readOnly || !isEditableOutputs ? undefined : ctx.handlers.onAddBelow,
      onAddChild: node.readOnly || !isEditableOutputs ? undefined : ctx.handlers.onAddChild,
      onRemove: node.readOnly || !isEditableOutputs ? undefined : ctx.handlers.onRemove,
    };

    if (isEditableOutputs) {
      props.allowChildren = (type: string) => {
        return /^List/.test(type) || type === "List" || type === "Object" || type === "Dict" || type === "Pydantic";
      };

      if (isPydanticOrhasPydanticParent(node, ctx.flatItems || [])) {
        const isItemItselfPydantic = node.type === "Pydantic";
        Object.assign(props.hidden as object, { description: false, optional: isItemItselfPydantic });
        Object.assign(props.readOnly as object, { description: false, optional: isItemItselfPydantic });
      }

      if (!node.parentId) {
        props.typeOptions = VALUE_TYPE_ITEMS_START;
      }
    }

    return props;
  },
};

export default function RightPanelOutputs({ outputs }: Props) {
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
    items: outputs,
    onChange: handleOutputsChange,
    addTemporaryPlaceholder: isEditableOutputs,
  });

  if (!name) return null;

  if (name in typeBasedComponents) {
    return typeBasedComponents[name as keyof typeof typeBasedComponents];
  }

  return (
    <NodeIOSection
      roots={treeRoots}
      valueOptions={[]}
      selectedNode={selectedNode!}
      flatItems={outputs}
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
