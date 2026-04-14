import * as React from "react";

import { Option, useInputTagContext } from "./input-tag";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/utils";

interface InputTagListContextValue {
  selected?: Option;
  onSelectedChange: (option: NonNullable<Option>) => void;
}

const InputTagListContext = React.createContext<InputTagListContextValue | undefined>(undefined);

export const useInputTagListContext = () => {
  const context = React.useContext(InputTagListContext);
  if (!context) {
    throw new Error("InputTag components must be used within InputTag.List");
  }
  return context;
};

interface InputTagListProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

const InputTagList = React.forwardRef<
  HTMLDivElement,
  InputTagListProps & {
    dropdownProps?: React.ComponentPropsWithoutRef<typeof DropdownMenu>;
    selected?: Option;
    onSelectedChange?: (option: NonNullable<Option>) => void;
    defaultSelected?: Option;
  }
>(({ className, children, dropdownProps, selected: controlledSelected, onSelectedChange, defaultSelected, ...props }, ref) => {
  const [selected, setSelected] = React.useState<Option | undefined>(defaultSelected);

  const isControlled = controlledSelected !== undefined && onSelectedChange !== undefined;

  const handleSelectedChange = React.useCallback(
    (option: NonNullable<Option>) => {
      if (isControlled) {
        onSelectedChange?.(option);
      } else {
        setSelected(option);
        onSelectedChange?.(option);
      }
    },
    [isControlled, onSelectedChange, setSelected]
  );

  const contextValue = React.useMemo(
    () => ({ selected: isControlled ? controlledSelected : selected, onSelectedChange: handleSelectedChange }),
    [isControlled, controlledSelected, selected, handleSelectedChange]
  );

  return (
    <InputTagListContext.Provider value={contextValue}>
      <DropdownMenu {...dropdownProps}>
        <div ref={ref} className={cn("inline-flex items-center", className)} {...props}>
          {children}
        </div>
      </DropdownMenu>
    </InputTagListContext.Provider>
  );
});
InputTagList.displayName = "InputTag.List";

const InputTagTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuTrigger> & {
    placeholder?: string;
    align?: "start" | "end" | null;
    readonly?: boolean;
  }
>(({ className, children, align = "start", placeholder = "Select an option", readonly: readonlyProp, ...props }, ref) => {
  const { error, readonly, isGtConnected } = useInputTagContext();
  const { selected } = useInputTagListContext();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const shadowDivRef = React.useRef<HTMLDivElement>(null);

  React.useImperativeHandle(ref, () => triggerRef.current as HTMLButtonElement);

  React.useEffect(() => {
    if (!shadowDivRef.current || !triggerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      const rect = triggerRef.current!.getBoundingClientRect();
      shadowDivRef.current!.style.width = rect.width + "px";
      shadowDivRef.current!.style.height = rect.height + "px";
    });
    resizeObserver.observe(triggerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  React.useEffect(() => {
    if (!triggerRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      const rect = triggerRef.current?.parentElement?.getBoundingClientRect();
      if (!rect) return;
      triggerRef.current!.style.height = rect.height + "px";
    });
    resizeObserver.observe(triggerRef.current.parentElement!);
  }, []);

  React.useLayoutEffect(() => {
    if (align === null) return;
    if (!triggerRef.current) return;
    const rootEl = triggerRef.current.closest("[tag-root=true]");
    if (!rootEl) return;
    const mutationObserver = new MutationObserver(() => {
      const rect = rootEl.getBoundingClientRect();
      if (!rect) return;
      const attrib = triggerRef.current!.getAttribute("aria-controls");
      if (!attrib) return;
      const content = document.getElementById(attrib);
      if (!content) return;
      // Triggring setTimeout 0 to ensure the content is rendered with the correct bounding rect
      setTimeout(() => {
        const contentRect = content.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const newMargin = align === "start" ? rect.left - contentRect.left : rect.right - contentRect.right;
        const newLeftPosition = contentRect.left + newMargin;
        const newRightPosition = contentRect.right + newMargin;
        if (newLeftPosition >= 0 && newRightPosition <= viewportWidth) {
          content.parentElement!.style.marginLeft = `${newMargin}px`;
        }
      }, 0);
    });
    mutationObserver.observe(triggerRef.current!, { attributes: true, attributeFilter: ["aria-controls"] });
    return () => mutationObserver.disconnect();
  }, [align]);

  return (
    <>
      <DropdownMenuTrigger
        ref={triggerRef}
        className={cn(
          "inline-flex peer disabled:select-none disabled:pointer-events-none self-stretch items-center justify-center whitespace-nowrap rounded-none px-1 py-0.5 text-sm hover:bg-accent",
          "ring-offset-background ring-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:absolute focus-visible:rounded-md",
          "data-[state=open]:absolute data-[state=open]:rounded-md data-[state=open]:outline-none data-[state=open]:ring-2 data-[state=open]:ring-offset-2",
          error && "text-destructive",
          // Add hover effect when gt is connected
          isGtConnected && "hover:bg-blue-accent/20 hover:text-primary",
          !selected?.label && "text-muted-foreground",
          className
        )}
        disabled={readonly || readonlyProp}
        {...props}
      >
        {children || selected?.label || placeholder}
      </DropdownMenuTrigger>
      <div
        ref={shadowDivRef}
        className="hidden left-0 top-0 peer-focus-visible:block peer-focus-visible:invisible peer-data-[state=open]:block peer-data-[state=open]:invisible z-[-1]"
      />
    </>
  );
});
InputTagTrigger.displayName = "InputTag.Trigger";

export { InputTagList, InputTagTrigger };
