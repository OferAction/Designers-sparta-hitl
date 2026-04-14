import { Fragment, useCallback, useState } from "react";

import { TextTIcon } from "@phosphor-icons/react";

import { StringTypeIcon as IconString } from "@/lib/icons";
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { InputTag, Option } from "@/components/ui/input-tag";
import { VALUE_TYPE_ITEMS_ENHANCHED } from "@/components/ui/input-tag/old-deprecated/InputTag/constants";
import { VALUE_ICONS_MAP } from "@/constants";
import { cn } from "@/utils";

const IconTagItem = ({ option, ICONS }: { option: NonNullable<Option>; ICONS?: (value: string) => React.ElementType }) => {
  const IconToRender = ICONS?.(option.value) ?? TextTIcon;
  return (
    <InputTag.Item key={option.value} option={option}>
      <IconToRender className="w-4 h-4" /> {option.label}
    </InputTag.Item>
  );
};

export const IconSelectTag = ({
  selectedOption,
  onOptionChange,
  options = VALUE_TYPE_ITEMS_ENHANCHED,
  ICONS = VALUE_ICONS_MAP,
  defaultValue,
  disabled = false,
  iconClassName,
}: {
  selectedOption?: Option;
  onOptionChange?: (type: NonNullable<Option>) => void;
  options?: NonNullable<Option>[];
  ICONS?: (value: string) => React.ElementType;
  defaultValue?: Option;
  disabled?: boolean;
  iconClassName?: string;
}) => {
  const [selected, setSelected] = useState<Option | undefined>(defaultValue);

  const isControlled = selectedOption !== undefined && onOptionChange !== undefined;

  const finalSelected = isControlled ? selectedOption : selected;

  const handleSelectedChange = useCallback(
    (option: NonNullable<Option>) => {
      if (isControlled) {
        onOptionChange?.(option);
      } else {
        setSelected(option);
        onOptionChange?.(option);
      }
    },
    [isControlled, onOptionChange, setSelected]
  );

  const IconToRender = finalSelected?.value ? ICONS(finalSelected.value) : IconString;
  return (
    <InputTag.List selected={finalSelected} onSelectedChange={handleSelectedChange}>
      <InputTag.Trigger disabled={disabled}>
        <IconToRender className={cn("w-4 h-4", iconClassName)} />
      </InputTag.Trigger>
      <InputTag.Content>
        <InputTag.Label>Value Type</InputTag.Label>
        {options.length && <DropdownMenuSeparator />}
        {options.map((option, index) => {
          if (option.children) {
            return (
              <Fragment key={option.value}>
                <InputTag.Group title={option.label}>
                  {option.label && <InputTag.GroupTitle>{option.label}</InputTag.GroupTitle>}
                  {option.children.map((child) => (
                    <IconTagItem key={child.value} option={child} ICONS={ICONS} />
                  ))}
                </InputTag.Group>
                {index !== options.length - 1 && <DropdownMenuSeparator />}
              </Fragment>
            );
          }
          return <IconTagItem key={option.value} option={option} ICONS={ICONS} />;
        })}
      </InputTag.Content>
    </InputTag.List>
  );
};
