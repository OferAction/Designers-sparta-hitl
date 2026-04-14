import { useEffect, useRef } from "react";

import { OptionsDropdown } from "../OptionsDropdown";
import { InputTag, Option } from "@/components/ui/input-tag";

export const AutocompleteTag = ({
  selectedOption,
  onOptionChange,
  options,
  placeholder = "Type or select a value",
  defaultValue,
  canOpenDropdown = true,
  disabled = false,
  className,
  autoFocus = false,
  onAutoFocusComplete,
}: {
  selectedOption?: Option;
  onOptionChange?: (option: NonNullable<Option>) => void;
  options?: NonNullable<Option>[];
  placeholder?: string;
  defaultValue?: Option;
  canOpenDropdown?: boolean;
  disabled?: boolean;
  className?: string;
  autoFocus?: boolean;
  onAutoFocusComplete?: () => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasFocusedRef = useRef(false);

  useEffect(() => {
    if (autoFocus && !hasFocusedRef.current) {
      inputRef.current?.focus();
      hasFocusedRef.current = true;
      onAutoFocusComplete?.();
    }
  }, [autoFocus, onAutoFocusComplete]);

  return (
    <InputTag.Command
      className={className}
      defaultSearchValue={defaultValue}
      searchValue={selectedOption}
      onSearchValueChange={onOptionChange}
      placeholder={placeholder}
    >
      <InputTag.Input ref={inputRef} readOnly={disabled} placeholder={placeholder} />
      {canOpenDropdown && options && <OptionsDropdown options={options} emptyMessage="No options found." />}
    </InputTag.Command>
  );
};
