import { XCircleIcon } from "@phosphor-icons/react";

import { HighlightedText } from "@/components/common/HighlightedText";
import { Loader } from "@/components/common/Loader";
import { InputTag, type Option } from "@/components/ui/input-tag";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";

interface FunctionListDropdownProps {
  options: Option[];
  isLoading: boolean;
  isOpen: boolean;
  searchQuery?: string;
  onSelectOption: (option: Option) => void;
}

/** Renders a searchable dropdown list of available preprocessing functions */
export function FunctionListDropdown({ options, isLoading, isOpen, searchQuery, onSelectOption }: FunctionListDropdownProps) {
  return (
    <Popover open={isOpen}>
      <PopoverAnchor className="absolute inset-0 pointer-events-none" />
      <PopoverContent
        className="p-0 min-w-[--radix-popover-trigger-width] w-fit max-w-sm"
        align="start"
        side="bottom"
        sideOffset={4}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onCloseAutoFocus={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideWhenDetached
      >
        <InputTag.CommandList className="max-h-60 w-full" style={{ position: "relative", top: "unset", left: "unset", marginTop: 0 }}>
          {isLoading ? (
            <div className="py-6 text-center text-sm flex items-center justify-center gap-2">
              <Loader />
              Loading...
            </div>
          ) : (
            <>
              <InputTag.CommandEmpty className="flex w-full min-w-32 px-2 py-0.5 justify-center items-center gap-1 self-stretch text-muted-foreground">
                <div className="flex items-center mt-1.5 gap-1">
                  <XCircleIcon weight="fill" className="inline-block" size={16} />
                  no matched functions
                </div>
              </InputTag.CommandEmpty>

              <InputTag.CommandGroup>
                {options.length > 0 && <InputTag.GroupTitle>Add Functions</InputTag.GroupTitle>}
                {options.map((option) => {
                  if (!option) return null;
                  const paramType = option.type;
                  return (
                    <InputTag.CommandItem
                      key={option.value}
                      value={option.value}
                      option={option}
                      onSelect={() => onSelectOption(option)}
                      className="cursor-pointer flex items-center justify-between w-full"
                    >
                      <span className="text-sm whitespace-nowrap">
                        <HighlightedText text={option.label} query={searchQuery} />
                        {paramType !== "None" && `[` + (paramType === "Regex" ? "regex_pattern" : " ") + `]`}
                      </span>
                    </InputTag.CommandItem>
                  );
                })}
              </InputTag.CommandGroup>
            </>
          )}
        </InputTag.CommandList>
      </PopoverContent>
    </Popover>
  );
}
