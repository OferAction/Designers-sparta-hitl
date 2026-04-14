import React, { useMemo } from "react";

import { PlusIcon, RowsPlusBottomIcon, TrashIcon } from "@phosphor-icons/react";

import { AutocompleteTag, IconSelectTag } from "@/components/common/input-tags";
import { InputLabel } from "@/components/common/InputLabel";
import { Button } from "@/components/ui/button";
import { HoverActions, HoverActionWrapper } from "@/components/ui/HoverActionWrapper";
import { Input } from "@/components/ui/input";
import { InputTag, Option } from "@/components/ui/input-tag";
import { BOOLEAN_OPTIONS, VALUE_TYPE_ITEMS_ENHANCHED } from "@/components/ui/input-tag/old-deprecated/InputTag/constants";
import { TreeInputItem } from "@/modules/flow/hooks";
import { NodeIOItem } from "@/modules/flow/types";
import { cn } from "@/utils";

type Action = {
  id: string;
  icon: JSX.Element;
  onClick: () => void;
  label: string;
  destructive?: boolean;
};
export interface InputItemProps {
  item: TreeInputItem;
  isListElement?: boolean;
  isReference?: boolean;
  shouldHasChildren?: boolean;
  readOnly?: { key?: boolean; type?: boolean; value?: boolean; description?: boolean; optional?: boolean };
  hidden?: { key?: boolean; type?: boolean; value?: boolean; description?: boolean; optional?: boolean };
  valueOptions?: NonNullable<Option>[];
  typeOptions?: NonNullable<Option>[];
  typeProps?: Omit<React.ComponentPropsWithoutRef<typeof IconSelectTag>, "selectedOption" | "onOptionChange" | "options" | "disabled">;
  actions?: Action[];
  actionsOverride?: Action[];
  variableInitialSymbol?: string;
  placeholder?: string;
  allowBooleansValues?: boolean;
  className?: string;
  autoFocus?: boolean;
  onAutoFocusComplete?: () => void;

  onKeyChange?: (id: string, next: string) => void;
  onTypeChange?: (id: string, next: string) => void;
  onValueChange?: (id: string, next: NonNullable<Option>) => void;
  onDescriptionChange?: (id: string, next: string) => void;
  onOptionalToggle?: (id: string, next: boolean) => void;
  onAddBelow?: (id: string) => void;
  onAddChild?: (id: string) => void;
  onRemove?: (id: string) => void;
  getItemProps?: (id: TreeInputItem<NodeIOItem>) => Partial<InputItemProps>;
  allowChildren?: (type: string) => boolean;
}

const withStopPropagation = (fn?: (...args: any[]) => void) => (e: React.MouseEvent) => {
  e.stopPropagation();
  fn?.(e);
};

const defaultAllowChildren = (type: string) => {
  return /^List/.test(type) || type === "List" || type === "Object" || type === "Dict";
};

export const InputItem: React.FC<InputItemProps> = ({
  item,
  isListElement = false,
  shouldHasChildren,
  isReference = false,
  readOnly,
  hidden,
  valueOptions,
  typeOptions = VALUE_TYPE_ITEMS_ENHANCHED.filter((opt) => opt.value !== "Operators"),
  typeProps,
  onKeyChange,
  onTypeChange,
  onValueChange,
  onDescriptionChange,
  onOptionalToggle,
  onAddBelow,
  onAddChild,
  onRemove,
  actions = [],
  actionsOverride,
  variableInitialSymbol = "@",
  placeholder = "type value or @",
  allowBooleansValues = true,
  getItemProps,
  className,
  allowChildren = defaultAllowChildren,
  autoFocus = false,
  onAutoFocusComplete,
}) => {
  const {
    key: keyReadOnly = false,
    type: typeReadOnly = false,
    value: valueReadOnly = false,
    description: descriptionReadOnly = true,
    optional: optionalReadOnly = false,
  } = readOnly || {};
  const {
    key: keyHidden = false,
    type: typeHidden = false,
    value: valueHidden = false,
    description: descriptionHidden = true,
    optional: optionalHidden = true,
  } = hidden || {};
  const selectedType = useMemo<Option>(() => ({ label: item.type, value: item.type }), [item.type]);
  const keyOption = useMemo<Option>(() => ({ label: item.key, value: item.key }), [item.key]);

  const isVariable = useMemo(() => {
    if (item.isReference || item.value?.isReference || isReference) return true;
    const label = item.value?.label || item.value?.value;
    return typeof label === "string" && label.trim().startsWith(variableInitialSymbol);
  }, [isReference, item.isReference, item.value?.isReference, item.value?.label, item.value?.value, variableInitialSymbol]);

  const valueVariant = valueReadOnly ? "flat" : isVariable ? "variable" : "emphasized";
  const keyVariant = keyReadOnly ? "flat" : "emphasized";

  const isListType = /^List/.test(item.type) || item.type === "List";

  const isBoolean = allowBooleansValues && item.type === "Boolean";

  const handleValueChange = (opt: NonNullable<Option>) => {
    onValueChange?.(item.id, opt);
  };

  const isCollectionType = shouldHasChildren !== undefined ? shouldHasChildren : allowChildren(item.type);

  const hoverActions = useMemo(
    () =>
      actionsOverride ||
      [
        isCollectionType
          ? {
            id: "add-child",
            icon: <RowsPlusBottomIcon className="w-4 h-4" />,
            onClick: onAddChild && (() => onAddChild?.(item.id)),
            label: isListType ? "Add Item" : "Add Field",
          }
          : {
            id: "add-below",
            icon: <PlusIcon className="w-4 h-4" />,
            onClick: onAddBelow && (() => onAddBelow?.(item.id)),
            label: "Add Below",
          },
        {
          id: "delete",
          icon: <TrashIcon className="w-4 h-4" />,
          onClick: onRemove && (() => onRemove?.(item.id)),
          label: "Delete",
          destructive: true,
        },
      ]
        .filter((action) => action.onClick)
        .concat(actions),
    [actions, actionsOverride, isCollectionType, isListType, item.id, onAddBelow, onAddChild, onRemove]
  );

  const keyValueReadonly = (keyReadOnly || keyHidden) && (valueReadOnly || valueHidden);

  return (
    <div className="flex flex-col w-full rounded-md">
      <HoverActionWrapper className={cn("flex items-center gap-2 w-full px-2 py-1 rounded-md", className)}>
        <div className="flex flex-col flex-1 min-w-0" data-width-constraint>
          <div className="flex items-center w-full min-w-0 grow-0">
            {!keyHidden && !isListElement && (
              <InputTag.Root className={cn(keyReadOnly && "pointer-events-none")} variant={keyVariant}>
                <AutocompleteTag
                  disabled={keyReadOnly}
                  placeholder="key"
                  selectedOption={keyOption}
                  onOptionChange={(opt) => onKeyChange?.(item.id, opt?.label || "")}
                />
              </InputTag.Root>
            )}
            {!keyHidden && !isListElement && <div className="w-2 h-px border-t border-dashed border-focus" />}
            <div className={cn("flex items-center gap-2 min-w-0 grow-0", isListElement && "grow-0")}>
              <InputTag.Root variant={valueVariant} readonly={keyValueReadonly} className={cn("flex items-stretch")}>
                {!typeHidden && (
                  <IconSelectTag
                    selectedOption={selectedType}
                    onOptionChange={(opt) => onTypeChange?.(item.id, opt.value)}
                    options={typeOptions}
                    disabled={typeReadOnly}
                    {...typeProps}
                  />
                )}
                {!valueHidden && !item.children?.length && (
                  <AutocompleteTag
                    placeholder={placeholder}
                    selectedOption={item.value}
                    onOptionChange={(opt) => handleValueChange(opt)}
                    options={isBoolean && !isVariable ? BOOLEAN_OPTIONS : valueOptions}
                    canOpenDropdown={!valueReadOnly && (isVariable || (!isVariable && isBoolean))}
                    disabled={valueReadOnly}
                    className={cn(typeReadOnly && !typeHidden && "!border-l-0")}
                    autoFocus={autoFocus}
                    onAutoFocusComplete={onAutoFocusComplete}
                  />
                )}
              </InputTag.Root>

              {!optionalHidden && (
                <InputLabel
                  type="button"
                  onClick={() => onOptionalToggle?.(item.id, !item.required)}
                  variant={optionalReadOnly ? "flat" : "emphasized"}
                  className={cn("min-w-0", optionalReadOnly && "pointer-events-none")}
                >
                  {item.required ? "*" : "optional"}
                </InputLabel>
              )}
            </div>
            {/* Hover Actions */}
            {hoverActions.length > 0 && !item.isPlaceholder && (
              <HoverActions position="right">
                {hoverActions.map((action) => (
                  <Button
                    key={action.id}
                    size="icon"
                    variant="ghost"
                    title={action.label}
                    className={cn("w-9 h-full", action.destructive && "hover:bg-destructive/10")}
                    onClick={withStopPropagation(action.onClick)}
                  >
                    {action.icon}
                  </Button>
                ))}
              </HoverActions>
            )}
          </div>
          {!descriptionHidden && (
            <div className="mt-0.5 flex items-center">
              <Input
                variant="tag"
                placeholder="Description"
                className={cn(
                  "flex-1 border-0 p-1 h-6 text-sm text-muted-foreground placeholder:leading-5",
                  item.description && "border border-muted",
                  descriptionReadOnly && "pointer-events-none border-none"
                )}
                value={item.description || ""}
                onChange={(e) => onDescriptionChange?.(item.id, e.target.value)}
              />
            </div>
          )}
        </div>
      </HoverActionWrapper>

      {/* Children (list / dict) */}
      {!!item.children?.length && (
        <div className="flex">
          <div className="mx-2 border-l border-border self-stretch grow-0" />
          <div className="flex flex-col gap-1 mt-1 flex-1 min-w-0">
            {item.children?.map((child) => (
              <InputItem
                key={child.id}
                item={child}
                isListElement={isListType}
                readOnly={readOnly}
                hidden={hidden}
                valueOptions={valueOptions}
                typeOptions={typeOptions}
                onKeyChange={onKeyChange}
                onTypeChange={onTypeChange}
                onValueChange={onValueChange}
                onDescriptionChange={onDescriptionChange}
                onOptionalToggle={onOptionalToggle}
                onAddBelow={onAddBelow}
                onAddChild={onAddChild}
                onRemove={onRemove}
                {...getItemProps?.(child)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

InputItem.displayName = "InputItem";

export default InputItem;
