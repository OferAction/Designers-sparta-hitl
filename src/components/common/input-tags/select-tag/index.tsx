import { useCallback, useState } from "react";

import { CaretUpDownIcon } from "@phosphor-icons/react";

import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { InputTag } from "@/components/ui/input-tag";
import { Option } from "@/components/ui/input-tag";

const SelectItem = ({ option }: { option: NonNullable<Option> }) => {
  return (
    <InputTag.Item key={option.value} option={option}>
      {option.icon && <option.icon className="size-4" />}
      {option.label}
    </InputTag.Item>
  );
};

const SelectItemRenderer = ({ option, isFirst }: { option: NonNullable<Option>; isFirst: boolean }) => {
  if (option.children) {
    if (option.children.length === 0) return null;

    return (
      <>
        {!isFirst && <DropdownMenuSeparator />}
        <InputTag.Group>
          {option.label && <InputTag.GroupTitle>{option.label}</InputTag.GroupTitle>}
          {option.children.map((child) => (
            <SelectItem key={child.value} option={child} />
          ))}
        </InputTag.Group>
      </>
    );
  }
  return <SelectItem key={option.value} option={option} />;
};

export const SelectTag = ({
  selectedOption,
  onOptionChange,
  options = [],
  placeholder = "Select an option",
  hasDropdownArrow = false,
  defaultValue,
  triggerProps,
  className,
}: {
  selectedOption?: Option;
  onOptionChange?: (option: NonNullable<Option>) => void;
  options?: NonNullable<Option>[];
  placeholder?: string;
  hasDropdownArrow?: boolean;
  defaultValue?: Option;
  triggerProps?: React.HTMLAttributes<HTMLButtonElement>;
  className?: string;
}) => {
  const [selected, setSelected] = useState<Option | undefined>(defaultValue);
  const isControlled = selectedOption !== undefined && onOptionChange !== undefined;

  const finalSelected = isControlled ? selectedOption : selected;

  const handleSelectedChange = useCallback(
    (option: NonNullable<Option>) => {
      if (isControlled) {
        onOptionChange(option);
      } else {
        setSelected(option);
        onOptionChange?.(option);
      }
    },
    [isControlled, onOptionChange, setSelected]
  );

  return (
    <InputTag.List selected={finalSelected} onSelectedChange={handleSelectedChange}>
      <InputTag.Trigger placeholder={placeholder || "Select value"} {...triggerProps}>
        <span className={className}>{finalSelected?.label || placeholder}</span>
        {hasDropdownArrow && <CaretUpDownIcon className="h-3 w-3 text-border ml-1.5 " />}
      </InputTag.Trigger>
      <InputTag.Content>
        {!options.length && <InputTag.Label>No options found</InputTag.Label>}
        {options.map((option, index) => (
          <SelectItemRenderer key={option.value} option={option} isFirst={index === 0} />
        ))}
      </InputTag.Content>
    </InputTag.List>
  );
};
