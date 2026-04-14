import * as React from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/utils";

export type TimePickerProps = {
  value?: string; // "HH:mm" (24h) or empty string
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
  minuteStep?: number; // default 5
  label?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export default function TimePicker({ value = "", onChange, className, disabled, minuteStep = 5 }: TimePickerProps) {
  const [hour, setHour] = React.useState<string>("");
  const [minute, setMinute] = React.useState<string>("");

  // Initialize from value
  React.useEffect(() => {
    if (!value) {
      setHour("");
      setMinute("");
      return;
    }
    const [h, m] = value.split(":");
    if (h !== undefined && m !== undefined) {
      setHour(h);
      setMinute(m);
    }
  }, [value]);

  const emit = React.useCallback(
    (h: string, m: string) => {
      if (h && m) onChange(`${h}:${m}`);
    },
    [onChange]
  );

  const hours = React.useMemo(() => Array.from({ length: 24 }, (_, i) => pad2(i)), []);
  const minutes = React.useMemo(() => Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => pad2(i * minuteStep)), [minuteStep]);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={hour}
        onValueChange={(h) => {
          setHour(h);
          emit(h, minute);
        }}
        disabled={disabled}
      >
        <SelectTrigger className={cn("w-[80px] bg-background", !hour && "text-muted-foreground")}>
          <SelectValue placeholder="HH" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground select-none">:</span>
      <Select
        value={minute}
        onValueChange={(m) => {
          setMinute(m);
          emit(hour, m);
        }}
        disabled={disabled}
      >
        <SelectTrigger className={cn("w-[80px] bg-background", !minute && "text-muted-foreground")}>
          <SelectValue placeholder="MM" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
