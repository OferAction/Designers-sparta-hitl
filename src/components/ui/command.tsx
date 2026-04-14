import * as React from "react";

import { XIcon, MagnifyingGlassIcon as Search, CaretRightIcon as ChevronRight } from "@phosphor-icons/react";
import { type DialogProps } from "@radix-ui/react-dialog";
import { Command as CommandPrimitive } from "cmdk";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Popover, PopoverAnchor, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const Command = React.forwardRef<React.ElementRef<typeof CommandPrimitive>, React.ComponentPropsWithoutRef<typeof CommandPrimitive>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive
      ref={ref}
      className={cn(
        " flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground backdrop-blur-[20px] border-r border-border overflow-y-scroll overflow-x-hidden",
        className
      )}
      {...props}
    />
  )
);
Command.displayName = CommandPrimitive.displayName;

const CommandDialog = ({ children, ...props }: DialogProps) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
};

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input> & {
    hideSearchIcon?: boolean;
    containerClassName?: string;
    suggestion?: { before: string; match: string; after: string; canSuggest: boolean };
    showClearButton?: boolean;
    onClear?: () => void;
  }
>(({ className, containerClassName, suggestion, hideSearchIcon = false, showClearButton = false, onClear, ...props }, ref) => (
  <div
    className={cn("flex items-center px-3 border-b border-border focus-within:border-purple-accent transition-colors", containerClassName)}
    cmdk-input-wrapper=""
  >
    {!hideSearchIcon ? <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" /> : null}
    {suggestion?.canSuggest && <span className="invisible h-0 text-nowrap">{suggestion.before}</span>}
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      autoComplete="on"
      {...props}
    />
    {showClearButton && onClear && (
      <button
        type="button"
        onClick={onClear}
        className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100 transition-opacity"
        aria-label="Clear search"
      >
        <XIcon className="h-4 w-4" />
      </button>
    )}
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<React.ElementRef<typeof CommandPrimitive.List>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.List ref={ref} className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)} {...props} />
  )
);

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Empty>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>>(
  (props, ref) => <CommandPrimitive.Empty ref={ref} className="py-6 text-center text-sm" {...props} />
);

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Group>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Group
      ref={ref}
      className={cn(
        "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => <CommandPrimitive.Separator ref={ref} className={cn("-mx-1 h-px bg-border", className)} {...props} />);
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<React.ElementRef<typeof CommandPrimitive.Item>, React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>>(
  ({ className, ...props }, ref) => (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        "relative flex cursor-default gap-2 select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
);

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
};
CommandShortcut.displayName = "CommandShortcut";

// Inline expandable parent item replacing portal-based submenu logic.
interface ExpandableParentProps extends React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> {
  nestedItems?: React.ReactElement[];
  label?: string;
  value?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const CommandExpandableParent: React.FC<ExpandableParentProps> = ({
  nestedItems = [],
  label,
  value,
  icon: Icon,
  className,
  onSelect: originalOnSelect,
  ...rest
}) => {
  const [open, setOpen] = React.useState(false);
  const itemRef = React.useRef<HTMLDivElement | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const hasNestedItems = nestedItems.length > 0;
  const aggregated = React.useMemo(() => {
    const vals: string[] = [];
    nestedItems.forEach((child) => {
      if (React.isValidElement(child)) {
        const props: any = child.props;
        if (typeof props.value === "string") vals.push(props.value);
        if (typeof props.children === "string") vals.push(props.children);
        if (props.option && typeof props.option.label === "string") vals.push(props.option.label);
      }
    });
    return vals.join(" ");
  }, [nestedItems]);
  const combinedValue = [value, aggregated].filter(Boolean).join(" ");

  const containsWithinContainer = React.useCallback((target: EventTarget | null) => {
    if (!target || !(target instanceof Node)) return false;
    return containerRef.current?.contains(target) ?? false;
  }, []);

  const handleMouseEnter = React.useCallback(() => {
    if (!hasNestedItems) return;
    setOpen(true);
  }, [hasNestedItems]);

  const handleMouseLeave = React.useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!hasNestedItems) return;
      if (containsWithinContainer(event.relatedTarget)) return;
      setOpen(false);
    },
    [containsWithinContainer, hasNestedItems]
  );

  // Close on global escape if open.
  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" || e.key === "ArrowLeft") {
        setOpen(false);
        itemRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handler, true);
    return () => document.removeEventListener("keydown", handler, true);
  }, [open]);

  const handleSelect = React.useCallback(
    (selectedValue: string) => {
      if (!hasNestedItems) {
        originalOnSelect?.(selectedValue);
        return;
      }
      setOpen(true);
    },
    [hasNestedItems, originalOnSelect]
  );

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowRight" && hasNestedItems) {
        event.preventDefault();
        setOpen(true);
      } else if ((event.key === "ArrowLeft" || event.key === "Escape") && open) {
        event.preventDefault();
        setOpen(false);
        itemRef.current?.focus();
      }
    },
    [hasNestedItems, open]
  );

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!hasNestedItems) return;
      setOpen(next);
    },
    [hasNestedItems]
  );

  return (
    <Popover open={hasNestedItems ? open : false} onOpenChange={handleOpenChange}>
      <div
        ref={containerRef}
        className={cn("flex flex-col", className)}
        data-expandable=""
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <PopoverAnchor asChild>
          <CommandPrimitive.Item
            ref={itemRef}
            {...rest}
            value={combinedValue}
            onSelect={handleSelect}
            onKeyDown={handleKeyDown}
            className={cn(
              "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors",
              "hover:bg-accent/70 hover:text-accent-foreground",
              "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground"
            )}
          >
            {Icon && <Icon className="mr-2 size-4" />}
            <span className="flex-1 truncate">{label}</span>
            {hasNestedItems && <ChevronRight className={cn("ml-auto h-4 w-4 opacity-70 transition-transform")} aria-hidden="true" />}
          </CommandPrimitive.Item>
        </PopoverAnchor>
        {hasNestedItems ? (
          <PopoverContent
            disablePortal
            side="right"
            align="start"
            sideOffset={0}
            className="max-h-[300px] w-fit overflow-y-auto rounded-md border bg-popover p-1 shadow-md flex flex-col gap-0.5"
            onOpenAutoFocus={(event) => event.preventDefault()}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              itemRef.current?.focus();
            }}
            onEscapeKeyDown={() => setOpen(false)}
          >
            {nestedItems.map((child, i) => React.cloneElement(child, { key: child.key ?? i }))}
          </PopoverContent>
        ) : null}
      </div>
    </Popover>
  );
};

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
  CommandExpandableParent,
};
