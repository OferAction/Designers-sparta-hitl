import * as React from "react";

import { cva } from "class-variance-authority";
import { CaretUpDownIcon as ChevronsUpDown, CheckIcon as Check } from "@phosphor-icons/react";

import { usePermission } from "@/hooks/usePermission";

import WithTooltip from "../common/WithTooltip";
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@/components/ui/command";
import { Option } from "@/components/ui/input-tag/old-deprecated/InputTag/types";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const buttonStyles = cva("flex hover:bg-background/60  w-full items-center gap-2 justify-between px-3 py-2 text-sm rounded-md border transition", {
  variants: {
    open: {
      true: "border-white bg-background/90 shadow-[0_0_0_1px] shadow-white/40",
      false: "border-border bg-background hover:border-white/70",
    },
  },
  defaultVariants: { open: false },
});

export interface ComboboxProps extends Omit<React.ComponentPropsWithoutRef<typeof PopoverTrigger>, "onChange" | "value" | "asChild"> {
  options: Option[];
  value: Option | null;
  onChange: (opt: Option | null) => void;
  placeholder?: string;
  triggerClassName?: string;
  contentClassName?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  alignOffset?: number;
  stickyFooterAction?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
  };
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select…",
  triggerClassName,
  contentClassName,
  side = "bottom",
  align = "start",
  sideOffset = 4,
  alignOffset = 0,
  stickyFooterAction,
  ...props
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const { hasPermission } = usePermission();
  const ctx = {
    hasPermission,
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild {...props}>
        <button type="button" className={cn(buttonStyles({ open }), "overflow-hidden", triggerClassName)} aria-expanded={open}>
          <div className="flex items-center gap-2 min-w-0 truncate">
            {value?.icon && <value.icon className="size-4 shrink-0" weight="fill" />}
            <span className="truncate">{value?.label ?? placeholder}</span>
          </div>
          <ChevronsUpDown className={cn("size-4 shrink-0", open ? "text-white" : "text-muted-foreground")} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        disablePortal
        className={cn("p-0 z-[100] w-[var(--radix-popover-trigger-width)]", contentClassName)}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        style={{ isolation: "isolate" }}
      >
        <Command className="bg-popover">
          <CommandInput placeholder="Search…" className="border-none focus:ring-0" />
          <CommandList className="max-h-[220px] overflow-y-auto thin-scrollbar">
            <CommandGroup className="w-full">
              {options.map((option) => {
                if (option.isTitle) {
                  return (
                    <WithTooltip tooltip={option.label} delayDuration={0}>
                      <div key={option.value} className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {option.label}
                      </div>
                    </WithTooltip>
                  );
                }

                return (
                  <CommandItem
                    key={option.value}
                    value={`${option.label} ${option.value}`}
                    onSelect={(val) => {
                      const strVal = String(val ?? "");
                      const selectedOption = options.find((o) => {
                        if (o.isTitle) return false;
                        const combined = `${o.label} ${o.value}`;
                        return combined === strVal || String(o.value) === strVal || o.label.toLowerCase() === strVal.toLowerCase();
                      });
                      onChange(selectedOption || null);
                      setOpen(false);
                    }}
                    className="cursor-pointer hover:bg-accent hover:text-accent-foreground w-full flex items-center gap-2 truncate "
                    {...("props" in option && option.props ? (typeof option.props === "function" ? option.props(ctx) : option.props) : {})}
                  >
                    {option.icon && <option.icon className="min-h-4 min-w-4 h-4 w-4" weight="fill" />}
                    <WithTooltip tooltip={option.label} delayDuration={0}>
                      <span className="truncate">{option.label}</span>
                    </WithTooltip>
                    <Check className={cn("ml-auto min-h-4 min-w-4 h-4 w-4", value?.value === option.value ? "opacity-100" : "opacity-0")} />
                  </CommandItem>
                );
              })}
            </CommandGroup>
            <CommandEmpty>No results found.</CommandEmpty>
          </CommandList>
          {stickyFooterAction && (
            <div className="border-t border-border sticky bottom-0 bg-popover">
              <button
                type="button"
                onClick={() => {
                  stickyFooterAction.onClick();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
              >
                {stickyFooterAction.icon}
                <span>{stickyFooterAction.label}</span>
              </button>
            </div>
          )}
        </Command>
      </PopoverContent>
    </Popover>
  );
}
