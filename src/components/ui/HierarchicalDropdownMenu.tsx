import * as React from "react";

import { cva } from "class-variance-authority";
import { CaretUpDownIcon as ChevronsUpDown, CheckIcon as Check } from "@phosphor-icons/react";

import { usePermission } from "@/hooks/usePermission";

import { Loader } from "@/components/common/Loader";
import { Command, CommandInput } from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Option } from "@/components/ui/input-tag/old-deprecated/InputTag/types";
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

export interface HierarchicalComboboxProps
  extends Omit<React.ComponentPropsWithoutRef<typeof DropdownMenuTrigger>, "onChange" | "value" | "asChild"> {
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
  isLoading?: boolean;
}

export function HierarchicalDropdownMenu({
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
  isLoading = false,
  ...props
}: HierarchicalComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const { hasPermission } = usePermission();
  const ctx = {
    hasPermission,
  };

  const normalized = (s?: string) => (s || "").toLowerCase();

  const searchMatches = React.useMemo(() => {
    const q = normalized(search);
    if (!q) return { parents: options, childrenByParent: new Map<string, Option[]>() };
    const parents: Option[] = [];
    const childrenByParent = new Map<string, Option[]>();
    options.forEach((opt) => {
      const parentMatch = normalized(opt.label).includes(q);
      const childMatches = (opt.children || []).filter((child) => normalized(child.label).includes(q));
      if (parentMatch || childMatches.length > 0) {
        parents.push(opt);
        childrenByParent.set(String(opt.value), childMatches);
      }
    });
    return { parents, childrenByParent };
  }, [options, search]);

  const renderOptions = (opts: Option[], level = 0): React.ReactNode => {
    return opts.map((option) => {
      if (option.isTitle) {
        return (
          <div key={option.value} className="px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {option.label}
          </div>
        );
      }

      if (option.children && option.children.length > 0) {
        return (
          <DropdownMenuSub key={option.value}>
            <DropdownMenuSubTrigger
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onChange(option);
                setOpen(false);
              }}
              className="w-full"
              {...("props" in option && option.props ? (typeof option.props === "function" ? option.props(ctx) : option.props) : {})}
            >
              <div className="flex items-center gap-2 truncate w-full">
                {option.icon && <option.icon className="min-h-4 min-w-4 h-4 w-4" weight="fill" />}
                <span className="truncate">{option.label}</span>
                <Check className={cn("ml-auto min-h-4 min-w-4 h-4 w-4", value?.value === option.value ? "opacity-100" : "opacity-0")} />
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>{renderOptions(option.children, level + 1)}</DropdownMenuSubContent>
          </DropdownMenuSub>
        );
      } else {
        return (
          <DropdownMenuItem
            key={option.value}
            onClick={() => {
              onChange(option);
              setOpen(false);
            }}
            className="cursor-pointer hover:bg-accent hover:text-accent-foreground w-full flex items-center gap-2 truncate"
            {...("props" in option && option.props ? (typeof option.props === "function" ? option.props(ctx) : option.props) : {})}
          >
            {option.icon && <option.icon className="min-h-4 min-w-4 h-4 w-4" weight="fill" />}
            <span className="truncate">{option.label}</span>
            <Check className={cn("ml-auto min-h-4 min-w-4 h-4 w-4", value?.value === option.value ? "opacity-100" : "opacity-0")} />
          </DropdownMenuItem>
        );
      }
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild {...props}>
        <button type="button" className={cn(buttonStyles({ open }), triggerClassName)} aria-expanded={open}>
          <div className="flex items-center gap-2 truncate">
            {value?.icon && <value.icon className="min-h-4 min-w-4 h-4 w-4" weight="fill" />}
            <span className="truncate">{value?.label ?? placeholder}</span>
          </div>
          <ChevronsUpDown className={cn("min-h-4 min-w-4 h-4 w-4", open ? "text-white" : "text-muted-foreground")} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn("p-0 z-[100] w-[var(--radix-popover-trigger-width)]", contentClassName)}
        side={side}
        align={align}
        sideOffset={sideOffset}
        alignOffset={alignOffset}
        onCloseAutoFocus={(e) => e.preventDefault()}
        style={{ isolation: "isolate" }}
      >
        {isLoading ? (
          <div className="px-14 py-2 text-sm text-muted-foreground flex items-center gap-2">
            <Loader />
            <span>Loading…</span>
          </div>
        ) : options.length === 0 ? (
          <div className="px-16 py-2 text-sm text-muted-foreground">No results</div>
        ) : (
          <>
            <Command className="bg-popover">
              <CommandInput
                placeholder="Search…"
                className="border-none focus:ring-0"
                value={search}
                onValueChange={setSearch}
                autoFocus
                onKeyDownCapture={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              />
            </Command>
            <div className="max-h-[220px] overflow-y-auto thin-scrollbar">
              {search.trim()
                ? searchMatches.parents.map((parent) => {
                    const matchedChildren = searchMatches.childrenByParent.get(String(parent.value)) || [];
                    const hasMatchedChildren = matchedChildren.length > 0;

                    if (hasMatchedChildren) {
                      return (
                        <DropdownMenuSub key={parent.value}>
                          <DropdownMenuSubTrigger
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onChange(parent);
                              setOpen(false);
                            }}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {parent.icon && <parent.icon className="min-h-4 min-w-4 h-4 w-4" weight="fill" />}
                              <span className="truncate">{parent.label}</span>
                            </div>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {matchedChildren.map((child) => (
                              <DropdownMenuItem
                                key={child.value}
                                onClick={() => {
                                  onChange(child);
                                  setOpen(false);
                                }}
                                className="cursor-pointer hover:bg-accent hover:text-accent-foreground w-full flex items-center gap-2 truncate"
                                {...("props" in child && (child as any).props
                                  ? typeof (child as any).props === "function"
                                    ? (child as any).props(ctx)
                                    : (child as any).props
                                  : {})}
                              >
                                {child.icon && <child.icon className="min-h-4 min-w-4 h-4 w-4" weight="fill" />}
                                <span className="truncate">{child.label}</span>
                                <Check
                                  className={cn("ml-auto min-h-4 min-w-4 h-4 w-4", value?.value === child.value ? "opacity-100" : "opacity-0")}
                                />
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                      );
                    } else {
                      return (
                        <DropdownMenuItem
                          key={parent.value}
                          onClick={() => {
                            onChange(parent);
                            setOpen(false);
                          }}
                          className="cursor-pointer hover:bg-accent hover:text-accent-foreground w-full flex items-center gap-2 truncate"
                          {...("props" in parent && (parent as any).props
                            ? typeof (parent as any).props === "function"
                              ? (parent as any).props(ctx)
                              : (parent as any).props
                            : {})}
                        >
                          {parent.icon && <parent.icon className="min-h-4 min-w-4 h-4 w-4" weight="fill" />}
                          <span className="truncate">{parent.label}</span>
                          <Check className={cn("ml-auto min-h-4 min-w-4 h-4 w-4", value?.value === parent.value ? "opacity-100" : "opacity-0")} />
                        </DropdownMenuItem>
                      );
                    }
                  })
                : renderOptions(options)}
            </div>
          </>
        )}
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
