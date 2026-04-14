import React from "react";

import { Option } from "./types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";

interface MenuItemProps {
  item: Option;
  onSelect: (item: Option) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onSelect }) => {
  if (item.isTitle) {
    return <DropdownMenuLabel>{item.label}</DropdownMenuLabel>;
  }

  if (item.isSubTitle) {
    return (
      <DropdownMenuLabel className="font-sans font-medium text-xs leading-5 tracking-normal px-2 py-1.5 text-muted-foreground">
        {item.label}
      </DropdownMenuLabel>
    );
  }

  if (item.children?.length) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger>
          {item.icon && (
            <span className="mr-2">
              <item.icon />
            </span>
          )}
          <span>{item.label}</span>
          {item.command && <span className="ml-auto text-xs text-muted-foreground">{item.command}</span>}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent>
          {item.children.map((childItem) => (
            <MenuItem key={childItem.value} item={childItem} onSelect={onSelect} />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenuItem onSelect={() => onSelect(item)}>
      {item.icon && (
        <span className="mr-2">
          <item.icon />
        </span>
      )}
      <span>{item.label}</span>
      {item.command && <span className="ml-auto text-xs text-muted-foreground">{item.command}</span>}
    </DropdownMenuItem>
  );
};

interface DropdownProps extends Omit<React.ComponentProps<typeof DropdownMenuContent>, "onSelect"> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger: React.ReactNode;
  children?: React.ReactNode;
  options?: Option[];
  onSelect: (value: Option) => void;
  disabled?: boolean;
}

export const InputTagDropdown = ({ open, onOpenChange, disabled, trigger, options, onSelect, ...props }: DropdownProps) => {
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger disabled={disabled} asChild>
        {trigger}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-44" {...props}>
        {options && options.length > 0 ? (
          options.map((item, index) => (
            <React.Fragment key={`${item.value || index}`}>
              {item.label === "separator" ? <DropdownMenuSeparator /> : <MenuItem item={item} onSelect={onSelect} />}
            </React.Fragment>
          ))
        ) : (
          <div className="flex items-center justify-center">
            <DropdownMenuLabel className="tex-sm font-normal font-sans leading-5">No results found</DropdownMenuLabel>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
