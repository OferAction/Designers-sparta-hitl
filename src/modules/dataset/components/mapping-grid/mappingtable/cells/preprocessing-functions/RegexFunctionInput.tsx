import { useState, useRef, useMemo } from "react";

import { RegexPatternPopover } from "@/components/common";
import { InputTag, type Option } from "@/components/ui/input-tag";
import type { ParameterType } from "@/modules/dataset/types/preprocessing";

interface RegexFunctionInputProps {
  selectedFunction: { id: string; name: string; parameterType: ParameterType };
  searchValue: Option;
  onSearchValueChange: (value: Option) => void;
  onSubmit?: () => void;
  onClearSelection?: () => void;
}

/** Renders a regex pattern input with popover for functions that accept regex parameters */
export const RegexFunctionInput = ({ selectedFunction, searchValue, onSearchValueChange, onSubmit, onClearSelection }: RegexFunctionInputProps) => {
  const [isRegexPopoverOpen, setIsRegexPopoverOpen] = useState(true);
  const isSubmittingRef = useRef<boolean>(false);

  /** Derives the current regex pattern by stripping the function wrapper from the search value */
  const currentPattern = useMemo(() => {
    if (searchValue?.label) {
      const firstBracket = searchValue.label.indexOf("[");
      const lastBracket = searchValue.label.lastIndexOf("]");

      if (firstBracket !== -1 && lastBracket !== -1 && firstBracket < lastBracket) {
        return searchValue.label.substring(firstBracket + 1, lastBracket);
      }
    }
    return "";
  }, [searchValue?.label]);

  /** Handles popover close — submits pattern or clears selection based on state */
  const handlePopoverClose = (hasPattern: boolean) => {
    if (isSubmittingRef.current) {
      isSubmittingRef.current = false;
      setIsRegexPopoverOpen(false);
      return;
    }

    if (!hasPattern && onClearSelection) {
      onClearSelection();
    } else if (hasPattern && onSubmit) {
      const pattern = currentPattern;
      const formattedLabel = `${selectedFunction.name}[${pattern}]`;

      onSearchValueChange({
        label: formattedLabel,
        value: selectedFunction.id,
      });

      setTimeout(() => {
        onSubmit();
      }, 0);
    }
    setIsRegexPopoverOpen(false);
  };

  /** Handles backspace on empty regex input to clear function selection */
  const handleRegexKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const target = e.target as HTMLTextAreaElement;
    if (e.key === "Backspace" && !target.value && onClearSelection) {
      e.preventDefault();
      onClearSelection();
      setIsRegexPopoverOpen(false);
    }
  };

  /** Marks submission in progress and triggers the parent submit handler */
  const handleRegexSubmit = () => {
    isSubmittingRef.current = true;
    onSubmit?.();
  };

  return (
    <InputTag.Root variant="emphasized" className="flex-1 min-w-0 w-full max-w-full">
      <InputTag.List className="flex-wrap w-full max-w-full">
        <RegexPatternPopover
          value={currentPattern}
          onChange={(pattern) => {
            onSearchValueChange({
              label: `${selectedFunction.name}[${pattern}]`,
              value: selectedFunction.id,
            });
          }}
          onSubmit={handleRegexSubmit}
          onKeyDown={handleRegexKeyDown}
          open={isRegexPopoverOpen}
          onOpenChange={(open) => {
            if (!open) {
              const pattern = currentPattern.trim();
              handlePopoverClose(!!pattern);
            } else {
              setIsRegexPopoverOpen(open);
            }
          }}
        >
          <span
            onClick={() => setIsRegexPopoverOpen(true)}
            className="w-full min-w-0 max-w-full min-h-12 max-h-12 overflow-y-auto whitespace-pre-wrap break-all text-blue-foreground bg-transparent text-sm px-2 py-1 cursor-pointer"
          >
            {selectedFunction.name}[<span className="text-purple-accent">regex_pattern</span>]
          </span>
        </RegexPatternPopover>
      </InputTag.List>
    </InputTag.Root>
  );
};
