import * as React from "react";

import { DropdownMenuLabel } from "@radix-ui/react-dropdown-menu";

import { useInputTagListContext } from "./input-tag-list";
import { DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Option } from "@/components/ui/input-tag/input-tag";
import { cn } from "@/utils";

const InputTagContent = React.forwardRef<React.ElementRef<typeof DropdownMenuContent>, React.ComponentPropsWithoutRef<typeof DropdownMenuContent>>(
  ({ className, children, ...props }, ref) => {
    return (
      <DropdownMenuContent
        ref={ref}
        align="start"
        className={cn(
          "relative z-50 min-w-[8rem] rounded-md border bg-popover p-1 text-popover-foreground shadow-md",
          "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {children}
      </DropdownMenuContent>
    );
  }
);
InputTagContent.displayName = "InputTag.Content";

const InputTagGroup = React.forwardRef<React.ElementRef<typeof DropdownMenuGroup>, React.ComponentPropsWithoutRef<typeof DropdownMenuGroup>>(
  ({ className, children, ...props }, ref) => {
    return (
      <DropdownMenuGroup ref={ref} className={cn(className)} {...props}>
        {children}
      </DropdownMenuGroup>
    );
  }
);
InputTagGroup.displayName = "InputTag.Group";

const InputTagItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuItem> & {
    option: NonNullable<Option>;
    onSelect?: (option: Option) => void;
  }
>(({ className, disabled, children, option, onSelect, ...props }, ref) => {
  const { selected, onSelectedChange } = useInputTagListContext();

  const handleSelect = React.useCallback(() => {
    onSelect?.(option);
    onSelectedChange(option);
  }, [onSelect, option, onSelectedChange]);

  return (
    <DropdownMenuItem
      ref={ref}
      className={cn(
        "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground data-[disabled=true]:select-none data-[disabled=true]:cursor-not-allowed data-[disabled=true]:opacity-50",
        "hover:bg-accent/80 focus:bg-accent/80 hover:text-accent-foreground",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      data-disabled={disabled}
      data-selected={selected?.value === option.value}
      data-value={option.value}
      data-label={option.label}
      onSelect={handleSelect}
      {...props}
    >
      {children}
    </DropdownMenuItem>
  );
});
InputTagItem.displayName = "InputTag.Item";

const InputTagLabel = React.forwardRef<React.ElementRef<typeof DropdownMenuLabel>, React.ComponentPropsWithoutRef<typeof DropdownMenuLabel>>(
  ({ className, children, ...props }, ref) => {
    return (
      <DropdownMenuLabel ref={ref} className={cn("px-2 py-1.5 text-sm", className)} {...props}>
        {children}
      </DropdownMenuLabel>
    );
  }
);
InputTagLabel.displayName = "InputTag.Label";

const InputTagGroupTitle = React.forwardRef<React.ElementRef<typeof DropdownMenuLabel>, React.ComponentPropsWithoutRef<typeof DropdownMenuLabel>>(
  ({ className, children, ...props }, ref) => {
    return (
      <DropdownMenuLabel ref={ref} className={cn("px-2 py-1.5 text-xs text-muted-foreground", className)} {...props}>
        {children}
      </DropdownMenuLabel>
    );
  }
);
InputTagGroupTitle.displayName = "InputTag.GroupTitle";

export { InputTagContent, InputTagGroup, InputTagItem, InputTagLabel, InputTagGroupTitle };
