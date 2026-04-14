import * as React from "react";

import { Command as CommandPrimitive, useCommandState, defaultFilter } from "cmdk";

import { shouldShowSuggestions, useKeyboardNavigation, useSuggestionInfo } from "./hooks";
import { Option, useInputTagContext } from "./input-tag";
import { useAutoSizeInput } from "./useAutoSizeInput";
import { CommandInput } from "@/components/ui/command";
import { cn } from "@/utils";

// Command Context
interface InputTagCommandContextValue {
  searchValue?: Option;
  onValueChange: (value: NonNullable<Option>) => void;
  isControlled: boolean;
  isOpen: boolean;
  openCommand: () => void;
  closeCommand: () => void;
  commandWidth?: number | null;
}

const InputTagCommandContext = React.createContext<InputTagCommandContextValue | undefined>(undefined);

const useInputTagCommandContext = () => {
  const context = React.useContext(InputTagCommandContext);
  if (!context) {
    throw new Error("InputTag command components must be used within InputTag.Command");
  }
  return context;
};

const AutoResizingWrapper: React.FC<
  React.PropsWithChildren<{
    ref?: React.Ref<HTMLDivElement>;
    sizedRef: React.RefObject<HTMLSpanElement>;
    placeholder?: string;
    searchValue?: Option;
  }>
> = ({ children, sizedRef, placeholder, searchValue, ref }) => {
  const { isOpen } = useInputTagCommandContext();
  const cmdkValue = useCommandState((state) => state.value);
  const filteredCount = useCommandState((state) => state.filtered.count);

  const suggestionInfo = useSuggestionInfo({
    inputValue: searchValue,
    isOpen,
    containerRef: sizedRef,
    cmdkValue,
  });

  const getCurrentValue = () => {
    if (shouldShowSuggestions(searchValue, filteredCount, suggestionInfo)) {
      return `${suggestionInfo.before}${searchValue?.label}${suggestionInfo.after}`;
    }
    return searchValue?.label || placeholder || "";
  };

  React.useImperativeHandle(ref, () => sizerRef.current as HTMLDivElement);

  // Auto-size hook - sizes the input directly for natural flex behavior
  const sizerRef = useAutoSizeInput({
    inputRef: sizedRef,
    value: getCurrentValue(),
    minPx: 16,
    maxPx: 500,
  });

  return (
    <>
      <span ref={sizerRef} className="max-w-full fixed invisible whitespace-pre px-1 min-w-3 text-sm">
        {getCurrentValue()}
      </span>
      {children}
    </>
  );
};

// Root Command Component
interface InputTagCommandProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive> {
  searchValue?: Option;
  onSearchValueChange?: (value: NonNullable<Option>) => void;
  defaultSearchValue?: Option;
  canOpenDropdown?: boolean;
  placeholder?: string;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

const InputTagCommand = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, InputTagCommandProps>(
  (
    {
      className,
      placeholder,
      searchValue: controlledSearchValue,
      onSearchValueChange,
      defaultSearchValue,
      canOpenDropdown = true,
      children,
      isOpen: controlledIsOpen,
      onOpenChange: controlledOnOpenChange,
      ...props
    },
    ref
  ) => {
    const [internalSearchValue, setInternalSearchValue] = React.useState(defaultSearchValue);
    const [isOpenInner, setIsOpenInner] = React.useState(false);
    const isOpen = !!(canOpenDropdown && (controlledIsOpen ?? isOpenInner));
    const onOpenChange = controlledOnOpenChange ?? setIsOpenInner;
    const [commandWidth, setCommandWidth] = React.useState<number | null>(null);
    const commandRef = React.useRef<HTMLDivElement>(null);
    const sizedRef = React.useRef<HTMLDivElement>(null);

    const observerRef = React.useRef<ResizeObserver | null>(null);

    React.useImperativeHandle(ref, () => commandRef.current as HTMLDivElement);

    const isSearchControlled = controlledSearchValue !== undefined && onSearchValueChange !== undefined;
    const searchValue = isSearchControlled ? controlledSearchValue : internalSearchValue;

    const onValueChange = React.useCallback(
      (value: NonNullable<Option>) => {
        if (isSearchControlled) {
          onSearchValueChange(value);
        } else {
          setInternalSearchValue(value);
          onSearchValueChange?.(value);
        }
      },
      [isSearchControlled, onSearchValueChange]
    );

    const openCommand = React.useCallback(() => {
      onOpenChange(true);
    }, [onOpenChange]);

    const closeCommand = React.useCallback(() => {
      observerRef.current?.disconnect();
      observerRef.current = null;
      onOpenChange(false);
    }, [onOpenChange]);

    const contextValue = React.useMemo(
      () => ({
        searchValue,
        onValueChange,
        isOpen,
        openCommand,
        closeCommand,
        isControlled: isSearchControlled,
        commandWidth,
      }),
      [searchValue, onValueChange, isOpen, openCommand, closeCommand, isSearchControlled, commandWidth]
    );

    React.useLayoutEffect(() => {
      if (!sizedRef.current) return;
      const handler = () => {
        const rect = sizedRef.current!.getBoundingClientRect();
        setCommandWidth(rect.width);
      };
      const resizeObserver = new ResizeObserver(handler);
      handler();
      resizeObserver.observe(sizedRef.current);
      return () => {
        resizeObserver.disconnect();
      };
    }, [isOpen]);

    return (
      <InputTagCommandContext.Provider value={contextValue}>
        <CommandPrimitive
          ref={commandRef}
          className={cn("flex h-full text-sm max-w-full flex-1 flex-col overflow-visible text-popover-foreground min-w-0", className)}
          disablePointerSelection
          filter={(value, search, keywords) => {
            const s = search?.trimStart()?.startsWith("@") ? search?.trimStart()?.substring(1) : search;
            return defaultFilter(value, s, keywords);
          }}
          shouldFilter={true}
          {...props}
        >
          <AutoResizingWrapper ref={sizedRef} sizedRef={commandRef} placeholder={placeholder} searchValue={searchValue}>
            {children}
          </AutoResizingWrapper>
        </CommandPrimitive>
      </InputTagCommandContext.Provider>
    );
  }
);
InputTagCommand.displayName = "InputTag.Command";

// Input Component
interface InputTagInputProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> {
  containerClassName?: string;
}

const InputTagInput = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Input>, InputTagInputProps>(
  ({ className, containerClassName, onFocus, onBlur, readOnly, ...props }, ref) => {
    const { error, readonly, variant } = useInputTagContext();
    const { searchValue, onValueChange, isOpen, openCommand, closeCommand, commandWidth } = useInputTagCommandContext();
    const [focus, setFocus] = React.useState(false);

    const filteredCount = useCommandState((state) => state.filtered.count);
    const cmdkValue = useCommandState((state) => state.value);

    const containerRef = React.useRef<HTMLDivElement>(null);
    const shadowDivRef = React.useRef<HTMLDivElement>(null);

    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const suggestionInfo = useSuggestionInfo({
      inputValue: searchValue,
      isOpen,
      containerRef: inputRef,
      cmdkValue,
    });

    useKeyboardNavigation({
      isOpen,
      inputRef,
      openDropdown: openCommand,
    });

    const handleFocus = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        openCommand();
        setFocus(true);
        onFocus?.(event);
      },
      [openCommand, onFocus]
    );

    const handleBlur = React.useCallback(
      (event: React.FocusEvent<HTMLInputElement>) => {
        // Don't close if clicking on a command item
        if (event.relatedTarget?.closest("[cmdk-list]")) {
          return;
        }
        closeCommand();
        setFocus(false);
        onBlur?.(event);
      },
      [closeCommand, onBlur]
    );

    const handleValueChange = React.useCallback(
      (value: string) => {
        onValueChange({ label: value, value });
        openCommand();
      },
      [onValueChange, openCommand]
    );

    React.useLayoutEffect(() => {
      if (!shadowDivRef.current || !containerRef.current) return;
      if (!focus) {
        containerRef.current!.style.setProperty("--command-width", commandWidth + "px");
        shadowDivRef.current!.style.setProperty("--command-width", commandWidth + "px");
        return;
      }
      const handler = () => {
        const rect = containerRef.current!.getBoundingClientRect();
        shadowDivRef.current!.style.width = rect.width?.toFixed() + "px";
        shadowDivRef.current!.style.height = rect.height?.toFixed() + "px";

        const computedStyle = getComputedStyle(shadowDivRef.current!);
        containerRef.current!.style.setProperty("--command-width", computedStyle.width);
        shadowDivRef.current!.style.removeProperty("width");
      };
      const resizeObserver = new ResizeObserver(handler);
      resizeObserver.observe(containerRef.current);
      handler();
      return () => resizeObserver.disconnect();
    }, [commandWidth, focus]);

    return (
      <div className="group/command w-full min-w-0">
        <div
          ref={containerRef}
          className="has-[:focus]:ring-2 rounded-md has-[:focus]:absolute has-[:focus]:ring-offset-2 ring-primary ring-offset-background flex w-[var(--command-width)] has-[:focus]:text-foreground text-muted-foreground"
          style={{ "--command-width": commandWidth ? `${commandWidth}px` : "auto" } as React.CSSProperties}
        >
          <div className="relative text-sm flex w-full min-w-0">
            {shouldShowSuggestions(searchValue, filteredCount, suggestionInfo) && (
              <div className="absolute whitespace-pre text-sm top-0 left-0 px-1 py-0.5 pointer-events-none z-[100]">
                <span className="text-blue-accent group-data-[is-error=true]:text-destructive">{suggestionInfo.before}</span>
                <span className="text-primary font-medium">{searchValue?.label}</span>
                <span className="text-blue-accent group-data-[is-error=true]:text-destructive">{suggestionInfo.after}</span>
              </div>
            )}
            <CommandInput
              ref={inputRef}
              value={searchValue?.label}
              onValueChange={handleValueChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              containerClassName={cn("border-none p-0 w-full", containerClassName)}
              hideSearchIcon
              suggestion={suggestionInfo}
              className={cn(
                "flex h-[unset] w-full border-none rounded-none bg-transparent hover:bg-accent py-0.5 px-1 text-sm outline-none placeholder:text-muted-foreground",
                searchValue?.label?.trim() && suggestionInfo.canSuggest ? "text-transparent caret-primary selection:bg-accent/30" : "",
                "disabled:cursor-default disabled:pointer-events-none",
                readonly || (readOnly && "disabled:cursor-default disabled:pointer-events-none disabled:opacity-100 pointer-events-none"),
                error && "text-destructive placeholder:text-destructive/70",
                variant === "variable" && "text-purple-accent",
                className
              )}
              disabled={readonly || readOnly}
              {...props}
            />
          </div>
        </div>
        <div
          ref={shadowDivRef}
          className="hidden max-w-full w-[var(--command-width)] group-has-[:focus]/command:block group-has-[:focus]/command:invisible"
          style={{ "--command-width": commandWidth ? `${commandWidth}px` : "auto" } as React.CSSProperties}
        />
      </div>
    );
  }
);
InputTagInput.displayName = "InputTag.Input";

// List Component
const InputTagCommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, children, ...props }, ref) => {
  const { isOpen } = useInputTagCommandContext();

  if (!isOpen) {
    return null;
  }

  return (
    <CommandPrimitive.List
      ref={ref}
      className={cn(
        "max-h-50 animate-in fade-in-0 zoom-in-95 absolute top-full mt-1 left-0 z-[100] rounded outline-none bg-background border shadow-md min-w-max w-56 max-w-full max-h-[300px] overflow-y-auto overflow-x-hidden",
        className
      )}
      {...props}
    >
      {children}
    </CommandPrimitive.List>
  );
});
InputTagCommandList.displayName = "InputTag.CommandList";

const InputTagCommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => <CommandPrimitive.Empty ref={ref} className={cn("py-6 text-center text-sm", className)} {...props} />);
InputTagCommandEmpty.displayName = "InputTag.CommandEmpty";

const InputTagCommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground",
      "[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
));
InputTagCommandGroup.displayName = "InputTag.CommandGroup";

interface InputTagCommandItemProps extends Omit<React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>, "onSelect"> {
  onSelect?: (value: Option) => void;
  option: NonNullable<Option>;
}

const InputTagCommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Item>, InputTagCommandItemProps>(
  ({ className, onSelect, children, option, ...props }, ref) => {
    const { closeCommand, onValueChange } = useInputTagCommandContext();

    const handleSelect = React.useCallback(
      (value: NonNullable<Option>) => {
        onValueChange(value);
        onSelect?.(value);
        closeCommand();
      },
      [onValueChange, onSelect, closeCommand]
    );

    return (
      <CommandPrimitive.Item
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center px-2 py-1.5 gap-2 text-sm outline-none",
          "data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50",
          "data-[selected=false]:hover:bg-accent/50 hover:text-accent-foreground",
          className
        )}
        onSelect={() => handleSelect(option)}
        data-label={option.label}
        value={option.value}
        keywords={option.keywords}
        {...props}
      >
        {children}
      </CommandPrimitive.Item>
    );
  }
);
InputTagCommandItem.displayName = "InputTag.CommandItem";

// Separator Component
const InputTagCommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-border", className)} {...props} />);
InputTagCommandSeparator.displayName = "InputTag.CommandSeparator";

export {
  InputTagCommand,
  InputTagInput,
  InputTagCommandList,
  InputTagCommandEmpty,
  InputTagCommandGroup,
  InputTagCommandItem,
  InputTagCommandSeparator,
  useInputTagCommandContext,
};
