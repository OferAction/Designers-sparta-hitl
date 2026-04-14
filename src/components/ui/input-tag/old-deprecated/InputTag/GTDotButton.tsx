import { Circle, Plus, X } from "@phosphor-icons/react";

import { InputTagContextProps, useInputTagContextSelector } from "./contexts";
import { cn } from "@/lib/utils";

const selector = (ctx: InputTagContextProps) => ({
  setIsGTMenuOpen: ctx.setIsGTMenuOpen,
  isGTMenuOpen: ctx.isGTMenuOpen,
});

export const GTDotButton = () => {
  const { setIsGTMenuOpen, isGTMenuOpen } = useInputTagContextSelector(selector);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        setIsGTMenuOpen(!isGTMenuOpen);
      }}
      className={cn(
        "absolute -left-1 -top-1 z-[100] flex items-center pointer-events-auto justify-center rounded-full transition-all duration-200",
        "size-2.5 opacity-0 group-hover:opacity-100 group/dot",
        {
          "opacity-100 scale-150 border border-border-blue bg-blue-background hover:bg-border-blue": isGTMenuOpen,
          "bg-blue-accent hover:scale-150 hover:bg-blue-accent": !isGTMenuOpen,
        }
      )}
    >
      {!isGTMenuOpen && (
        <>
          <Circle className="size-[5.5px] text-white block group-hover/dot:hidden" weight="fill" />
          <Plus className="size-[7px] text-white hidden group-hover/dot:block" weight="bold" />
        </>
      )}

      {isGTMenuOpen && <X className="size-[7px] text-dot-active-icon cursor-pointer" weight="bold" />}
    </div>
  );
};
