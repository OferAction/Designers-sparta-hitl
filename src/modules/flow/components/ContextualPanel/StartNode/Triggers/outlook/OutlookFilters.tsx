import { Controller, type Control, useFormContext } from "react-hook-form";

import { folderOptions as defaultFolderOptions, lookBackUnitOptions } from "../constants";
import { Label } from "@/components/ui/label";
import MultiInput from "@/components/ui/multi-input";
import { MultiSelect } from "@/components/ui/multi-select";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/utils";

import type { FolderOption, OutlookFormValues } from "./types";

type Props = { control: Control<OutlookFormValues>; folderOptions?: FolderOption[] };

export default function OutlookFilters({ control, folderOptions }: Props) {
  const {
    formState: { errors, submitCount },
  } = useFormContext();
  const showErrors = submitCount > 0;
  return (
    <div className="pt-2 space-y-4">
      <div className="space-y-2">
        <Label className={cn("text-sm", showErrors && (errors as any)?.folders ? "text-destructive" : "text-foreground")}>Folders</Label>
        <Controller
          name="folders"
          control={control}
          rules={{ required: true, validate: (v) => Array.isArray(v) && v.length > 0 }}
          render={({ field }) => (
            <MultiSelect
              options={folderOptions ?? defaultFolderOptions}
              defaultValue={field.value}
              onValueChange={field.onChange}
              variant="secondary"
              className="bg-background"
              modalPopover
              error={showErrors && (errors as any)?.folders}
              errorMessage="Select at least one folder"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label className={cn("text-sm", showErrors && (errors as any)?.from ? "text-destructive" : "text-muted-foreground")}>Sender</Label>
        <Controller
          name="fromMatch"
          control={control}
          render={() => (
            <Select value="oneOf" disabled>
              <SelectTrigger className="bg-background text-sm opacity-70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oneOf">One of</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <Controller
          name="from"
          control={control}
          rules={{ required: true, validate: (vals) => Array.isArray(vals) && vals.length > 0 }}
          render={({ field }) => (
            <MultiInput
              defaultValue={field.value}
              onValueChange={field.onChange}
              placeholder="Type email address"
              className="border-border"
              validate={(v) => /.+@.+\..+/.test(v)}
              error={showErrors && (errors as any)?.from}
              errorMessage="Provide at least one sender email"
            />
          )}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label className="text-sm text-foreground">Has Attachments</Label>
        <Controller
          name="hasAttachment"
          control={control}
          render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
        />
      </div>

      <div className="space-y-2">
        <Label className={cn("text-sm", showErrors && (errors as any)?.titleContains ? "text-destructive" : "text-foreground")}>Subject</Label>
        <Controller
          name="titleContainsMatch"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? "containsOneOf"} disabled>
              <SelectTrigger className="bg-background text-sm text-foreground border border-input opacity-70">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="containsOneOf">Contains one of</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <Controller
          name="titleContains"
          control={control}
          rules={{ required: true, validate: (vals) => Array.isArray(vals) && vals.length > 0 }}
          render={({ field }) => (
            <MultiInput
              defaultValue={field.value}
              onValueChange={field.onChange}
              placeholder="Type subject keywords"
              className="border-border"
              error={showErrors && (errors as any)?.titleContains}
              errorMessage="Enter at least one subject keyword"
            />
          )}
        />
      </div>

      <div className="space-y-2">
        <Label
          className={cn(
            "text-sm",
            showErrors && ((errors as any)?.lookBackValue || (errors as any)?.lookBackUnit) ? "text-destructive" : "text-foreground"
          )}
        >
          Look-Back Duration
        </Label>
        <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
          <Controller
            control={control}
            name="lookBackValue"
            rules={{ required: true }}
            render={({ field }) => (
              <NumberStepper
                className="w-16"
                value={field.value ? Number(field.value.value) : undefined}
                onChange={(v) => field.onChange(v != null ? { value: String(v), label: String(v) } : null)}
                min={1}
                max={365}
                step={1}
              />
            )}
          />
          <Controller
            name="lookBackUnit"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Select value={field.value != null ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                <SelectTrigger className="bg-background text-sm text-foreground border border-input w-[130px]">
                  <SelectValue placeholder="Days" />
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
        {showErrors && ((errors as any)?.lookBackValue || (errors as any)?.lookBackUnit) && (
          <p className="text-xs text-destructive">Specify look-back value and unit</p>
        )}
      </div>
    </div>
  );
}
