import React from "react";

import { Controller, Control, useWatch, useFormContext } from "react-hook-form";

import { hourOptions, lookBackUnitOptions, repeatsOptions, timeZoneOptions, RepeatTypeEnum } from "./constants";
import { DatePicker } from "@/components/ui/date-picker";
import { Label } from "@/components/ui/label";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/utils";

export type StartEventFieldNames = {
  date: string;
  time: string;
  repeatType: string;
  timeZone: string;
  repeatValue?: string;
  repeatUnit?: string;
};

export type StartEventScheduleSectionProps<TFormValues extends Record<string, any>> = {
  control: Control<TFormValues>;
  contentRef?: React.MutableRefObject<HTMLDivElement | null>;
  fieldNames: StartEventFieldNames;
  parseDate: (val: any) => Date | undefined;
  formatDate: (d: Date) => any;
};

export default function StartEventScheduleSection<TFormValues extends Record<string, any>>({
  control,
  contentRef,
  fieldNames,
  parseDate,
  formatDate,
}: StartEventScheduleSectionProps<TFormValues>) {
  const repeatTypeVal = useWatch({ control, name: fieldNames.repeatType as any }) as unknown as string | number | undefined;
  const isCustomRepeat = Number(repeatTypeVal) === RepeatTypeEnum.Custom;
  const { formState } = useFormContext();
  const showErrors = formState.submitCount > 0;
  const errors: any = formState.errors;

  return (
    <div className="space-y-4">
      <div className="pt-3">
        <div className="space-y-2">
          <Label
            className={cn("text-sm", showErrors && (errors?.[fieldNames.date] || errors?.[fieldNames.time]) ? "text-destructive" : "text-foreground")}
          >
            First Instance
          </Label>
          <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center">
            <Controller
              control={control}
              name={fieldNames.date as any}
              rules={{ required: true }}
              render={({ field }) => (
                <DatePicker
                  value={parseDate(field.value)}
                  onChange={(d) => field.onChange(d ? formatDate(d) : undefined)}
                  container={contentRef?.current || undefined}
                />
              )}
            />
            <span className="text-xs text-muted-foreground text-center">At</span>
            <Controller
              control={control}
              name={fieldNames.time as any}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger
                    className={cn(
                      "bg-background w-full text-sm text-foreground border",
                      showErrors && errors?.[fieldNames.time] ? "border-destructive bg-destructive/10" : "border-input"
                    )}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60 overflow-y-auto">
                    {hourOptions.map((h) => (
                      <SelectItem key={h.value} value={h.value}>
                        {h.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {showErrors && (errors?.[fieldNames.date] || errors?.[fieldNames.time]) && <p className="text-xs text-destructive">Date & time required</p>}

          <div className="pt-2 space-y-2">
            <Label className={cn("text-sm", showErrors && errors?.[fieldNames.repeatType] ? "text-destructive" : "text-foreground")}>Repeats</Label>
            <Controller
              control={control}
              name={fieldNames.repeatType as any}
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value != null ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                  <SelectTrigger
                    className={cn(
                      "bg-background w-full text-sm border",
                      showErrors && errors?.[fieldNames.repeatType] ? "border-destructive bg-destructive/10" : "border-input"
                    )}
                  >
                    <SelectValue placeholder="Select repeat" />
                  </SelectTrigger>
                  <SelectContent>
                    {repeatsOptions.map((opt) => (
                      <SelectItem key={opt.value} value={String(opt.value)}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {isCustomRepeat && fieldNames.repeatValue && fieldNames.repeatUnit && (
            <div className="pt-2 space-y-2">
              <Label
                className={cn(
                  "text-xs",
                  showErrors && (errors?.[fieldNames.repeatValue] || errors?.[fieldNames.repeatUnit]) ? "text-destructive" : "text-muted-foreground"
                )}
              >
                Repeat Every
              </Label>
              <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                <Controller
                  control={control}
                  name={fieldNames.repeatValue as any}
                  rules={{ required: isCustomRepeat }}
                  render={({ field }) => (
                    <NumberStepper className="w-16" value={field.value} onChange={(v) => field.onChange(v)} min={1} max={9} step={1} />
                  )}
                />
                <Controller
                  control={control}
                  name={fieldNames.repeatUnit as any}
                  rules={{ required: isCustomRepeat }}
                  render={({ field }) => (
                    <Select value={field.value != null ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                      <SelectTrigger
                        className={cn(
                          "bg-background text-sm text-foreground border w-[130px]",
                          showErrors && errors?.[fieldNames.repeatUnit as string] ? "border-destructive bg-destructive/10" : "border-input"
                        )}
                      >
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {lookBackUnitOptions.map((opt) => (
                          <SelectItem key={opt.value} value={String(opt.value)}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              {showErrors && (errors?.[fieldNames.repeatValue] || errors?.[fieldNames.repeatUnit]) && (
                <p className="text-xs text-destructive">Repeat value & unit required</p>
              )}
            </div>
          )}
        </div>

        <div className="pt-3 space-y-2">
          <Label className={cn("text-sm", showErrors && errors?.[fieldNames.timeZone] ? "text-destructive" : "text-foreground")}>Time Zone</Label>
          <Controller
            control={control}
            name={fieldNames.timeZone as any}
            rules={{ required: true }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  className={cn(
                    "bg-background text-sm w-full border",
                    showErrors && errors?.[fieldNames.timeZone] ? "border-destructive bg-destructive/10" : "border-input"
                  )}
                >
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timeZoneOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {showErrors && errors?.[fieldNames.timeZone] && <p className="text-xs text-destructive">Timezone required</p>}
        </div>
      </div>
    </div>
  );
}
