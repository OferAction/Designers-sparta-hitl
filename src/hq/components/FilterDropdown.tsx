import { useState } from 'react';
import { CaretDownIcon as ChevronDown } from "@phosphor-icons/react";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { MultiSelectMenu } from '@/components/ui/multi-select-menu';

interface Option {
  value: string;
  label: string;
}

interface Props {
  label: string;
  allLabel: string;
  options: Option[];
  selected: string[];
  onChange: (next: string[]) => void;
}

export default function FilterDropdown({ label, allLabel, options, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const allSelected = selected.length === options.length;

  const buttonLabel = allSelected
    ? allLabel
    : selected.length === 0
    ? `No ${label}`
    : selected.length === 1
    ? options.find((o) => o.value === selected[0])?.label ?? label
    : `${selected.length} ${label}`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className={`flex items-center h-9 gap-2 px-3.5 rounded-lg border text-sm font-medium transition-colors bg-card text-foreground ${
            open ? 'border-ring' : 'border-border hover:border-ring'
          }`}
        >
          {buttonLabel}
          <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        disablePortal
        align="end"
        sideOffset={6}
        className="w-auto min-w-[160px] p-1.5 rounded-xl border-border bg-card"
      >
        <MultiSelectMenu
          options={options}
          value={selected}
          onValueChange={onChange}
          className="flex flex-col"
        />
      </PopoverContent>
    </Popover>
  );
}
