import { useCallback, useRef } from "react";

import { useAncestorValueOptions } from "@/modules/flow/hooks/useAncestorValueOptions";
import useNodeIOItem from "@/modules/flow/hooks/useNodeIOItem";
import { useSelectedNode } from "@/modules/flow/hooks/useSelectedNode";

import { IOSectionConfig, NodeIOSection } from "@/modules/flow/components/ContextualPanel/shared/NodeIOSection";
import { isPydanticOrhasPydanticParent } from "@/modules/flow/components/IO";
import type { NodeInputItem, NodeVariant } from "@/modules/flow/types";
import { useGetSubflowsInputsOutputs } from "@/services/subflowConfiguratinService";
import { useFlowStore } from "@/store";

const config: IOSectionConfig = {
  title: "Subflow Inputs",
  getItemProps: (treeNode, ctx) => {
    const props: Record<string, any> = {
      readOnly: { key: true, type: true },
      hidden: {},
      actions: [],
      allowChildren: (type: string) => {
        return /^List/.test(type) || type === "List" || type === "Object" || type === "Dict" || type === "Pydantic";
      },
      onRemove: undefined,
      onAddBelow: undefined,
    };
    if (treeNode.parentId) {
      props.onAddBelow = ctx.handlers.onAddBelow;
    }
    if (isPydanticOrhasPydanticParent(treeNode, ctx.flatItems || [])) {
      const isItemItselfPydantic = treeNode.type === "Pydantic";
      if (!isItemItselfPydantic) {
        props.onRemove = ctx.handlers.onRemove;
      }
      Object.assign(props.hidden, { description: false, optional: isItemItselfPydantic, value: !isItemItselfPydantic });
      Object.assign(props.readOnly, {
        description: false,
        optional: isItemItselfPydantic,
        key: isItemItselfPydantic,
        type: isItemItselfPydantic,
      });
    }
    return props;
  },
};

export const SubflowDetails = () => {
  const selectedNode = useSelectedNode<NodeVariant<"subflow">>()!;
  const { data: subflowData, isLoading } = useGetSubflowsInputsOutputs(selectedNode?.data.subflowConfigId || "");
  const onChange = useFlowStore((state) => state.onChange);
  const previousSubflowData = useRef<typeof subflowData | null>(null);

  const handleChange = useCallback(
    (next: NodeInputItem[]) => {
      if (!selectedNode) return;
      onChange(selectedNode.id, "inputs", next);
    },
    [onChange, selectedNode]
  );

  const { treeRoots, onKeyChange, onDescriptionChange, onValueChange, onTypeChange, onAddChild, onRemove, onOptionalToggle, onAddBelow } =
    useNodeIOItem({
      items: selectedNode?.data.inputs,
      onChange: handleChange,
      addTemporaryPlaceholder: false,
    });
  const valueOptions = useAncestorValueOptions(selectedNode?.id);

  if (previousSubflowData.current !== subflowData && subflowData) {
    previousSubflowData.current = subflowData;

    onChange(selectedNode.id, "outputs", subflowData.end);
    const inputs = subflowData.start.map((nodeInput) => {
      const currentInput = selectedNode.data.inputs?.find((input) => input.id === nodeInput.id);
      if (currentInput) {
        return {
          ...nodeInput,
          value: currentInput.value,
        };
      }
      return nodeInput;
    });
    onChange(selectedNode.id, "inputs", inputs);
  }

  return (
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
        onAddChild,
        onRemove,
        onOptionalToggle,
        onAddBelow,
      }}
      loading={isLoading}
      {...config}
    />
  );
};

export default SubflowDetails;
