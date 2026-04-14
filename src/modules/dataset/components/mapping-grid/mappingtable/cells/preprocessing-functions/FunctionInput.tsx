import { useMemo, useState, useCallback } from "react";

import { FunctionListDropdown } from "./FunctionListDropdown";
import { RegexFunctionInput } from "./RegexFunctionInput";
import { createFilterFunction } from "./utils";
import { InputTag, type Option } from "@/components/ui/input-tag";
import Textarea from "@/components/ui/textarea";
import type { ParameterType, PreprocessingFunction, PreprocessingFunctionWithParams } from "@/modules/dataset/types/preprocessing";

interface FunctionInputTagProps {
  existingFunction?: PreprocessingFunctionWithParams;
  isEditing: boolean;
  searchValue: Option;
  onSearchValueChange: (value: Option) => void;
  selectedFunction: { id: string; name: string; parameterType: ParameterType } | null;
  availableFunctions: PreprocessingFunction[];
  isLoading: boolean;
  onSelectOption: (option: Option) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit?: () => void;
  onClearSelection?: () => void;
}

/** Renders the appropriate input control based on the selected function's parameter type */
export const FunctionInputTag = ({
  existingFunction,
  isEditing,
  searchValue,
  onSearchValueChange,
  selectedFunction,
  availableFunctions,
  isLoading,
  onSelectOption,
  onKeyDown,
  onSubmit,
  onClearSelection,
}: FunctionInputTagProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  /** Positions the cursor after the opening bracket when the textarea is mounted */
  const textareaCallbackRef = useCallback(
    (el: HTMLTextAreaElement | null) => {
      if (el && selectedFunction?.parameterType === "List") {
        const cursorPosition = selectedFunction.name.length + 1;
        el.setSelectionRange(cursorPosition, cursorPosition);
        el.focus();
      }
    },
    [selectedFunction]
  );

  /** Syncs textarea value changes back to the parent search state */
  const handleTextareaChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onSearchValueChange({ label: e.target.value, value: selectedFunction!.id });
    },
    [onSearchValueChange, selectedFunction]
  );

  const options: Option[] = useMemo(
    () =>
      availableFunctions.map((fn) => ({
        label: fn.name,
        value: fn.id,
        type: fn.parameterType,
      })),
    [availableFunctions]
  );

  const placeholder = "Type or select...";

  const filterFn = useMemo(() => createFilterFunction(options), [options]);

  if (existingFunction && !isEditing) {
    return null;
  }

  if (selectedFunction && selectedFunction.parameterType === "Regex") {
    return (
      <RegexFunctionInput
        selectedFunction={selectedFunction}
        searchValue={searchValue}
        onSearchValueChange={onSearchValueChange}
        onSubmit={onSubmit}
        onClearSelection={onClearSelection}
      />
    );
  }

  return (
    <InputTag.Root variant="emphasized" className="flex-1 min-w-0 w-full max-w-full">
      <InputTag.List className="flex-wrap w-full max-w-full">
        <InputTag.Command
          className="!w-full"
          searchValue={searchValue}
          onSearchValueChange={onSearchValueChange}
          placeholder={placeholder}
          canOpenDropdown={!selectedFunction}
          filter={filterFn}
          isOpen={isDropdownOpen}
          onOpenChange={setIsDropdownOpen}
        >
          {!selectedFunction && (
            <InputTag.Input
              className="text-sm !w-full min-w-0 text-blue-foreground overflow-y-auto"
              onKeyDown={onKeyDown}
              autoFocus
              placeholder={placeholder}
            />
          )}

          {selectedFunction && selectedFunction.parameterType === "List" && (
            <Textarea
              ref={textareaCallbackRef}
              value={searchValue?.label}
              onChange={handleTextareaChange}
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              className="text-blue-foreground bg-background text-sm px-3 py-1 resize-none w-full min-w-0 max-w-full overflow-y-auto whitespace-pre-wrap break-all"
              rows={1}
              spellCheck={false}
            />
          )}

          {selectedFunction && selectedFunction.parameterType === "Number" && (
            <InputTag.Input
              onKeyDown={onKeyDown}
              placeholder={placeholder}
              className="text-sm !w-full min-w-0 text-blue-foreground overflow-y-auto"
              autoFocus
            />
          )}

          {!selectedFunction && (
            <FunctionListDropdown
              options={options}
              isLoading={isLoading}
              isOpen={isDropdownOpen}
              searchQuery={searchValue?.label}
              onSelectOption={onSelectOption}
            />
          )}
        </InputTag.Command>
      </InputTag.List>
    </InputTag.Root>
  );
};
