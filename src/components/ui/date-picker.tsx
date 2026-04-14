"use client";

import { CalendarBlankIcon as CalendarIcon } from "@phosphor-icons/react";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: Date;
  onChange?: (date?: Date) => void;
  placeholder?: string;
  align?: "start" | "center" | "end";
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  formatDate?: (d: Date) => string;
  container?: HTMLElement | null;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  align = "start",
  side = "bottom",
  className,
  formatDate,
  container,
}: DatePickerProps) {
  const label = value ? (formatDate ? formatDate(value) : value.toLocaleDateString()) : placeholder;
  const disablePortal = !container;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "bg-background h-9 w-full border rounded-md px-3 flex items-center justify-between text-sm",
            !value && "text-muted-foreground",
            className
          )}
        >
          <span>{label}</span>
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-auto p-2"
        align={align}
        side={side}
        avoidCollisions
        sideOffset={4}
        container={disablePortal ? undefined : container}
        disablePortal={disablePortal}
        data-slot="popover-content"
      >
        <Calendar mode="single" selected={value} onSelect={onChange} />
      </PopoverContent>
    </Popover>
  );
}
