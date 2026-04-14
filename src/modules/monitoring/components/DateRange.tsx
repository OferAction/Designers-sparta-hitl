import * as React from "react";

import { CalendarBlankIcon } from "@phosphor-icons/react";
import { type CheckedState } from "@radix-ui/react-checkbox";
import { addDays, format } from "date-fns";
import { type DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const PRESET_RANGES = [
  { id: "last-7-days", label: "Last 7 days", days: 7 },
  { id: "last-30-days", label: "Last 30 days", days: 30 },
  { id: "last-90-days", label: "Last 90 days", days: 90 },
];

/**
 * Creates a UTC date using local calendar day values and explicit time.
 */
function createUTCDateFromLocalDay(date: Date, hours: number, minutes: number, seconds: number, milliseconds: number): Date {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, seconds, milliseconds));
}

/**
 * Normalizes a date range to UTC day boundaries.
 */
function normalizeRangeToUTC(range: DateRange | undefined): DateRange | undefined {
  if (!range?.from) {
    return undefined;
  }

  const from = createUTCDateFromLocalDay(range.from, 0, 0, 0, 0);
  const rangeEnd = range.to ?? range.from;
  const to = createUTCDateFromLocalDay(rangeEnd, 23, 59, 59, 999);

  return {
    from,
    to,
  };
}

export function DatePickerWithRange({ date, setDate }: { date: DateRange | undefined; setDate: (date: DateRange | undefined) => void }) {
  const [selectedPreset, setSelectedPreset] = React.useState<string | null>("last-30-days");

  const handlePresetToggle = React.useCallback(
    (presetId: string, days: number, nextChecked: CheckedState) => {
      if (nextChecked === true) {
        const today = new Date();
        const fromDay = addDays(today, -(days - 1));
        setDate(
          normalizeRangeToUTC({
            from: fromDay,
            to: today,
          })
        );
        setSelectedPreset(presetId);
        return;
      }

      if (nextChecked === false) {
        setSelectedPreset((current) => (current === presetId ? null : current));
        setDate(undefined);
      }
    },
    [setDate]
  );

  const handleDateSelect = React.useCallback(
    (range: DateRange | undefined) => {
      setSelectedPreset(null);
      setDate(normalizeRangeToUTC(range));
    },
    [setDate]
  );

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" id="date-picker-range" className="justify-start px-2.5 h-full font-normal rounded-lg bg-muted/40">
          <CalendarBlankIcon weight="fill" />
          {date?.from ? (
            date.to ? (
              <>
                {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
              </>
            ) : (
              format(date.from, "LLL dd, y")
            )
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex">
          <div className="flex flex-col gap-2 border-b border-border p-1 w-[200px]">
            {PRESET_RANGES.map(({ id, label, days }) => (
              <div key={id} className="flex items-center gap-2 p-1.5">
                <Checkbox id={id} checked={selectedPreset === id} onCheckedChange={(checked) => handlePresetToggle(id, days, checked)} />
                <Label htmlFor={id} className="cursor-pointer">
                  {label}
                </Label>
              </div>
            ))}
          </div>
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateSelect}
            disabled={{ after: new Date() }}
            numberOfMonths={2}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
