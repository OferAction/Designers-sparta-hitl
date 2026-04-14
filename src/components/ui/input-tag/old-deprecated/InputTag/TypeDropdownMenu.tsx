import React, { useEffect } from "react";

import { TextT } from "@phosphor-icons/react";

import { InputTagContextProps, useInputTagContextSelector } from "./contexts";
import { InputTagDropdown } from "./InputTagDropdown";
import { Option } from "./types";
import { typeVariant } from "./variants";
import { cn } from "@/lib/utils";

// Import the typeVariant and isError from a shared utils file or pass as prop

const selector = (ctx: InputTagContextProps) => ({
  selectedType: ctx.selectedType,
  typeDropdownOpen: ctx.typeDropdownOpen,
  setTypeDropdownOpen: ctx.setTypeDropdownOpen,
  setSelectedType: ctx.setSelectedType,
  isError: ctx.isError,
  appearance: ctx.appearance,
  disabled: ctx.disabled,
});

export const TypeDropdownMenu = ({
  options,
  initialType,
  onSelectType,
}: {
  options: Option[];
  initialType?: Option;
  onSelectType?: (type: Option) => void;
}) => {
  const [typeSelected, setTypeSelected] = React.useState(false);

  const { selectedType, typeDropdownOpen, setTypeDropdownOpen, setSelectedType, isError, appearance, disabled } =
    useInputTagContextSelector(selector);

  // Set initial type if provided
  useEffect(() => {
    if (initialType && options.length > 0) {
      const typeOption = options.find((opt) => opt.value === initialType?.value);
      if (typeOption) {
        setSelectedType(typeOption);
        setTypeSelected(true);
      }
    }
  }, [initialType, options, setSelectedType]);

  // Icon style based on dropdown state and error
  const currentIconStyle = cn(
    "relative flex justify-center items-center size-2 bg-accent group-hover/type:bg-muted-foreground/30",
    typeDropdownOpen && "bg-muted-foreground/30",
    "group-data-[is-error=true]:group-hover/type:bg-destructive/30 group-data-[is-error=true]:bg-destructive/30"
  );
  const IconToRender = selectedType?.icon || TextT;

  return (
    <InputTagDropdown
      open={typeDropdownOpen}
      onOpenChange={setTypeDropdownOpen}
      disabled={disabled}
      trigger={
        <div
          tabIndex={0}
          className={typeVariant({
            appearance: appearance,
            state: disabled ? "disabled" : undefined,
            status: isError ? "error" : undefined,
          })}
        >
          <div className={currentIconStyle}>
            <IconToRender
              className={cn(
                "size-4 text-muted-foreground absolute group-hover/type:text-foreground focus:text-foreground",
                "group-data-[is-error=true]/tag:text-destructive group-data-[is-error=true]:group-hover/type:text-destructive",
                typeDropdownOpen && "text-foreground",
                typeSelected && "text-primary"
              )}
            />
          </div>
        </div>
      }
      options={options}
      onSelect={(item) => {
        const selectedItem = options?.find((i) => i.value === item.value);
        if (selectedItem) {
          setSelectedType(selectedItem);
          onSelectType?.(selectedItem);
          setTypeSelected(true);
        }
      }}
    />
  );
};
