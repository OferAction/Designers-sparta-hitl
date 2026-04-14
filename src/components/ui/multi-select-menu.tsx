import * as React from "react";

import { Checkbox } from "./checkbox";
import type { MultiSelectOption } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";

type MultiSelectMenuProps = {
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (next: string[]) => void;
  className?: string;
  disabled?: boolean;
};

export function MultiSelectMenu({ options, value, onValueChange, className, disabled = false }: MultiSelectMenuProps) {
  const valueSet = React.useMemo(() => new Set(value), [value]);

  const toggle = (val: string) => {
    if (disabled) return;
    const next = valueSet.has(val) ? value.filter((v) => v !== val) : [...value, val];
    onValueChange(next);
  };

  return (
    <div className={className}>
      {options.map((opt) => {
        const checked = valueSet.has(opt.value);
        const Icon = opt.icon;
        return (
          <label
            key={opt.value}
            className={cn(
              "flex items-center gap-2 py-1 px-1 rounded cursor-pointer select-none",
              opt.disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
            )}
          >
            <Checkbox
              className="checked:accent-primary bg-background border-muted"
              checked={checked}
              disabled={disabled || opt.disabled}
              onCheckedChange={() => toggle(opt.value)}
            />
            {Icon ? <Icon className={cn("h-4 w-4", opt.style?.iconColor)} /> : null}
            <span className="text-sm">{opt.label}</span>
          </label>
        );
      })}
    </div>
  );
}

export default MultiSelectMenu;
