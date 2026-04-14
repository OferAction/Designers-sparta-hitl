import { useCallback, useMemo } from "react";

import { PlusIcon } from "@phosphor-icons/react";

import useAncestorValueOptions from "@/modules/flow/hooks/useAncestorValueOptions";
import useNodeIOItem, { TreeInputItem } from "@/modules/flow/hooks/useNodeIOItem";

import { Outputs } from "./types";
import { NonNullableOption } from "@/components/ui/input-tag";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle, SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { InputItem, InputItemProps } from "@/modules/flow/components/IO/InputItem";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeIOItem, NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

const filterOptionsByType = (options: NonNullableOption[], targetType: string): NonNullableOption[] => {
  return options
    .map((option) => {
      if (!option.children) return option;

      const filteredChildren = option.children
        .map((child) => {
          // If child is a rule group (type === 'group'), we need to filter its grandchildren
          if (child.type === "group" && Array.isArray(child.children)) {
            const filteredGroupChildren = child.children.filter((grand) => grand.type === targetType);
            if (filteredGroupChildren.length === 0) return null;
            return { ...child, children: filteredGroupChildren };
          }
          return child.type === targetType ? child : null;
        })
        .filter((c): c is NonNullableOption => c !== null);

      if (filteredChildren.length === 0) return null;

      return { ...option, children: filteredChildren };
    })
    .filter((opt): opt is NonNullableOption => opt !== null);
};

const getItemProps = (item: TreeInputItem<NodeIOItem>, allOptions: NonNullableOption[]): Partial<InputItemProps> => {
  const isParent = !item.parentId;

  // Get parent type for filtering
  const parentType = item.type || "String";
  const filteredOptions = filterOptionsByType(allOptions, parentType);

  return {
    shouldHasChildren: isParent,
    hidden: { optional: true, description: true, key: true },
    readOnly: { type: true },
    isReference: !isParent,
    placeholder: "Select variable...",
    valueOptions: filteredOptions,
    allowBooleansValues: false,
  };
};

function AggregatorOutputs() {
  const onChange = useFlowStore((state) => state.onChange);
  const selectedNode = useSelectedNode<NodeVariant<"aggregator">>();
  const selectedNodeId = selectedNode?.id || "";
  const { outputs = [] } = selectedNode?.data || {};
  const dropdownItems = useAncestorValueOptions(selectedNodeId);

  // Convert aggregator outputs structure to flat NodeIOItem array
  const flatItems = useMemo<NodeIOItem[]>(() => {
    const items: NodeIOItem[] = [];
    outputs.forEach((output) => {
      // Add parent output
      items.push({
        id: output.id,
        key: output.key,
        type: output.type,
        description: output.description || "",
        required: true,
        childrenIds: output.children.map((c) => c.id),
      });
      // Add children
      output.children.forEach((child) => {
        items.push({
          id: child.id,
          key: "",
          type: output.type,
          description: "",
          required: true,
          parentId: output.id,
          value: child,
        } as NodeIOItem);
      });
    });
    return items;
  }, [outputs]);

  // Convert flat NodeIOItem array back to aggregator outputs structure
  const handleItemsChange = useCallback(
    (items: NodeIOItem[]) => {
      const newOutputs: Outputs = [];
      const itemMap = new Map(items.map((item) => [item.id, item]));

      items.forEach((item) => {
        if (!item.parentId) {
          // This is a parent output
          const children = (item.childrenIds || [])
            .map((childId) => {
              const childItem = itemMap.get(childId);
              if (childItem && "value" in childItem && childItem.value) {
                return { id: childItem.id, ...(childItem.value as object) } as any;
              }
              return null;
            })
            .filter(Boolean);

          newOutputs.push({
            id: item.id,
            key: item.key,
            type: item.type,
            description: item.description || "",
            children,
          });
        }
      });
      onChange(selectedNodeId, "outputs", newOutputs);
    },
    [selectedNodeId, onChange]
  );

  const { treeRoots, onKeyChange, onDescriptionChange, handleAddInput, onValueChange, onTypeChange, onAddChild, onRemove } = useNodeIOItem({
    items: flatItems,
    onChange: handleItemsChange,
    addTemporaryPlaceholder: true,
    forceChildren: true,
    addTemporaryChildPlaceholdersDepth: 1,
    getPlaceholder: (initialData, allItems) => {
      if (initialData.parentId) {
        const parent = allItems.find((item) => item.id === initialData.parentId);
        return {
          type: parent ? parent.type : "String",
        };
      }
    },
  });

  return (
    <SectionContainer>
      <SectionTitle title="Merge variables">
        <SectionTitleButton onClick={() => handleAddInput({ label: "String", value: "String" })}>
          <PlusIcon className="text-foreground" size={16} />
        </SectionTitleButton>
      </SectionTitle>

      <div className="flex flex-col justify-center gap-2">
        {treeRoots.map((item) => (
          <InputItem
            key={item.id}
            item={item}
            shouldHasChildren
            hidden={{ optional: true, description: false, value: true }}
            readOnly={{ description: false }}
            onKeyChange={onKeyChange}
            onTypeChange={onTypeChange}
            onValueChange={onValueChange}
            onDescriptionChange={onDescriptionChange}
            onAddChild={onAddChild}
            onRemove={onRemove}
            getItemProps={(childItem) => getItemProps(childItem, dropdownItems)}
          />
        ))}
      </div>
    </SectionContainer>
  );
}

export default AggregatorOutputs;
