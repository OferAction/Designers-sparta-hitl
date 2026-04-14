import { Database } from "@phosphor-icons/react";

import { InputTagContextProps, useInputTagContextSelector } from "./contexts";
import { GTDotButton } from "./GTDotButton";
import { buttonFocus, buttonHover, buttonIdle } from "./variants";
import { cn } from "@/utils";

const selector = (ctx: InputTagContextProps) => ({
  value: ctx.value,
  placeholder: ctx.placeholder,
  selectedType: ctx.selectedType,
  isGTMenuOpen: ctx.isGTMenuOpen,
  setIsGTMenuOpen: ctx.setIsGTMenuOpen,
  isError: ctx.isError,
});

export const GTDropdownTrigger = () => {
  const { value, placeholder, selectedType, isGTMenuOpen, setIsGTMenuOpen, isError } = useInputTagContextSelector(selector);
  const IconToRender = selectedType?.icon || Database;

  return (
    <div
      tabIndex={0}
      onClick={() => setIsGTMenuOpen(!isGTMenuOpen)}
      className={cn(
        "flex items-center h-6 rounded-l-md border border-border-blue border-opacity-50 px-1",
        isGTMenuOpen ? buttonFocus : cn(buttonIdle, buttonHover)
      )}
    >
      <GTDotButton />

      <div className="flex items-center justify-center w-6 h-6">
        <IconToRender className={isError ? "h-4 w-4 text-destructive" : "h-4 w-4"} />
      </div>
      <div className={cn("flex-1 px-1 truncate", isError ? "text-destructive" : "text-inherit")}>{value || placeholder}</div>
    </div>
  );
};
