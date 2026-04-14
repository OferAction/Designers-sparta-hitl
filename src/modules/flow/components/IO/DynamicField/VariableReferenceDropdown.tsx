import { forwardRef } from "react";

import { OptionsDropdown, OptionsDropdownHandle } from "@/components/common/input-tags/OptionsDropdown";
import { CommandInput } from "@/components/ui/command";
import { InputTag, Option } from "@/components/ui/input-tag";

type VariableReferenceDropdownProps = {
  options: NonNullable<Option>[];
  position: { x: number; y: number } | null;
  onSelect: (option: NonNullable<Option>) => void;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  searchValue?: Option;
};

export const VariableReferenceDropdown = forwardRef<OptionsDropdownHandle, VariableReferenceDropdownProps>(
  ({ options, position, searchValue, onSelect }, ref) => {
    return (
      <div
        className="fixed z-50 min-w-[320px] overflow-visible max-w-[480px]"
        style={{
          left: `${position?.x || 0}px`,
          top: `${position?.y || 0}px`,
        }}
      >
        <InputTag.Command onSearchValueChange={onSelect} searchValue={searchValue} isOpen={true} onOpenChange={() => {}}>
          <CommandInput value={searchValue?.label} containerClassName="hidden" />
          <OptionsDropdown ref={ref} options={options} emptyMessage="No variables found." className="max-h-[300px] h-fit overflow-y-auto top-0" />
        </InputTag.Command>
      </div>
    );
  }
);

VariableReferenceDropdown.displayName = "VariableReferenceDropdown";
