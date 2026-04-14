import { useCallback } from "react";

import { LinkBreakIcon, PlusIcon } from "@phosphor-icons/react";
import { produce } from "immer";

import useNodeIOItem from "@/modules/flow/hooks/useNodeIOItem";
import { useSelectedNode } from "@/modules/flow/hooks/useSelectedNode";

import { DynamicOutputCommand } from "./components/DynamicOutputCommand";
import { SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { IOSectionConfig, NodeIOSection } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import type { NodeIOItem, NodeVariant } from "@/modules/flow/types/BaseNodeTypes";
import { useFlowStore } from "@/store";
import { cn } from "@/utils";

const outputResponseFormatConfig: IOSectionConfig = {
  title: "Output Response Format",
  headerActions: ({ handlers: { handleAddInput } }) =>
    handleAddInput && (
      <SectionTitleButton onClick={() => handleAddInput?.({ label: "String", value: "String" })}>
        <PlusIcon />
      </SectionTitleButton>
    ),
  getItemProps: (node, ctx) => ({
    hidden: {
      value: true,
      description: false,
      optional: false,
    },
    readOnly: {
      key: node.readOnly ?? false,
      type: node.readOnly ?? false,
      description: node.readOnly ?? false,
      optional: node.readOnly ?? false,
    },
    showDescription: true,
    onAddBelow: node.readOnly ? undefined : ctx.handlers.onAddBelow,
    onAddChild: node.readOnly ? undefined : ctx.handlers.onAddChild,
    onRemove: node.readOnly ? undefined : ctx.handlers.onRemove,
    onOptionalToggle: node.readOnly ? undefined : ctx.handlers.onOptionalToggle,
    actions: [
      {
        id: "add-reference",
        icon: <DynamicOutputCommand item={node} ctx={ctx} />,
        onClick: () => {},
        label: "add-reference",
      },
    ],
    actionsOverride: node.value?.isReference
      ? [
          {
            id: "remove-reference",
            icon: <LinkBreakIcon size={16} />,
            onClick: () => {
              const onReferenceChange = ctx.handlers.onReferenceChange as
                | ((id: string, value: { value: string; label: string; isReference?: boolean }, parentNodeType?: string) => void)
                | undefined;
              onReferenceChange?.(node.id, { value: "", label: "" });
            },
            label: "remove-reference",
          },
        ]
      : null,
    className: cn(node.value?.isReference && "bg-purple-accent/10 hover:bg-purple-accent/20"),
  }),
};

export function OutputResponseFormat() {
  const selectedNode = useSelectedNode<NodeVariant<"agent", "llmAgent">>();
  const onChange = useFlowStore((state) => state.onChange);

  const handleChange = useCallback(
    (nextItems: NodeIOItem[]) => {
      if (!selectedNode) return;
      onChange(selectedNode.id, "outputs", nextItems);
    },
    [onChange, selectedNode]
  );

  // Use the standard hook
  const {
    treeRoots,
    handleAddInput,
    onKeyChange,
    onDescriptionChange,
    onValueChange,
    onTypeChange,
    onAddBelow,
    onAddChild,
    onOptionalToggle,
    onRemove,
  } = useNodeIOItem({
    items: selectedNode?.data?.outputs || [],
    onChange: handleChange,
    addTemporaryPlaceholder: true,
  });

  /** Atomically updates both value and parentNodeType on an output item */
  const onReferenceChange = useCallback(
    (id: string, value: { value: string; label: string; isReference?: boolean }, parentNodeType?: string) => {
      if (!selectedNode) return;
      const outputs = selectedNode.data?.outputs || [];
      const next = produce(outputs, (draft) => {
        const target = draft.find((d) => d.id === id);
        if (!target) return;
        (target as Record<string, unknown>).value = value;
        if (parentNodeType) {
          target.parentNodeType = parentNodeType;
        } else {
          delete target.parentNodeType;
        }
      });
      onChange(selectedNode.id, "outputs", next);
    },
    [onChange, selectedNode]
  );

  if (!selectedNode) return null;

  return (
    <NodeIOSection
      roots={treeRoots}
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
        onOptionalToggle,
        onReferenceChange,
      }}
      {...outputResponseFormatConfig}
    />
  );
}

export default OutputResponseFormat;
