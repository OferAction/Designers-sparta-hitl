import { useCallback, useEffect, useMemo } from "react";

import useNodeIOItem from "@/modules/flow/hooks/useNodeIOItem";

import { Option } from "@/components/ui/input-tag";
import { VALUE_TYPE_ITEMS_ENHANCHED, getDropdownItemsByType } from "@/components/ui/input-tag/old-deprecated/InputTag/constants";
import { InputItem } from "@/modules/flow/components/IO";
import { NodeInputItem } from "@/modules/flow/types/BaseNodeTypes";
import { genId } from "@/utils";

export function InputTagRow({
  onDataChange,
  initialDataRow,
  options,
}: {
  onDataChange?: (data: NonNullable<Option>[]) => void;
  initialDataRow?: NonNullable<Option>[];
  options?: NonNullable<Option>[];
}) {
  // Transform initialDataRow to NodeInputItem format
  const initialItems = useMemo<NodeInputItem[]>(() => {
    if (!initialDataRow || initialDataRow.length === 0) {
      return [];
    }

    return initialDataRow.map((option) => ({
      id: option.id ?? genId(),
      key: "",
      type: option?.type || "String",
      value: option,
      description: "",
      required: true,
    }));
  }, [initialDataRow]);

  const handleChange = useCallback(
    (items: NodeInputItem[]) => {
      const options: NonNullable<Option>[] = items.map((item) => ({
        id: item.id,
        type: item.type,
        value: item.value?.value || "",
        label: item.value?.label || "",
        isReference: item.value?.isReference,
      }));
      onDataChange?.(options);
    },
    [onDataChange]
  );

  const { treeRoots, onTypeChange, onValueChange } = useNodeIOItem<NodeInputItem>({
    items: initialItems,
    onChange: handleChange,
    addTemporaryPlaceholder: true,
  });

  // Notify parent of initial state if starting empty
  useEffect(() => {
    if (initialDataRow === undefined || initialDataRow.length === 0) {
      onDataChange?.([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get value options based on type
  const getValueOptions = useCallback(
    (type: string) => {
      if (type === "logical-operator") {
        return getDropdownItemsByType(type);
      }
      return options;
    },
    [options]
  );

  // Render the input tags
  return (
    <div className="w-full flex flex-wrap gap-2">
      {treeRoots.map((tag) => {
        const isOperator = tag.type === "logical-operator";
        const valueOptions = getValueOptions(tag.type);

        return (
          <div key={tag.id} className="min-w-0">
            <InputItem
              item={tag}
              valueOptions={valueOptions}
              readOnly={{ key: true, description: true, optional: true }}
              hidden={{ key: true, description: true, optional: true, type: isOperator }}
              onTypeChange={onTypeChange}
              onValueChange={onValueChange}
              typeOptions={VALUE_TYPE_ITEMS_ENHANCHED}
              variableInitialSymbol={isOperator ? "" : "@"}
              placeholder={isOperator ? "select an operator" : undefined}
            />
          </div>
        );
      })}
    </div>
  );
}
