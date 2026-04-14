import { useQuery } from "@tanstack/react-query";
import { Controller, type Control, useWatch } from "react-hook-form";

import { lookBackUnitOptions, sizeTypeOptions, sizeUnitOptions } from "../constants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NumberStepper } from "@/components/ui/number-stepper";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { storageAccountsListQuery, getContainers } from "@/services";
import { cn } from "@/utils";

import type { AzureFormValues } from "./types";

type Props = { control: Control<AzureFormValues>; accountName: string | null; submitCount: number };

export default function AzureFilters({ control, accountName, submitCount }: Props) {
  const accountsQ = useQuery(storageAccountsListQuery());
  const containerNames = getContainers(accountsQ.data || [], accountName || undefined);
  const containerOptions = containerNames.map((name) => ({ value: name, label: name }));

  const showAccountError = !accountName && submitCount > 0;
  // Watch values to compute error state for labels (so we style label, not placeholder/input text)
  const containerValue = useWatch({ control, name: "container" });
  const filePatternValue = useWatch({ control, name: "filePattern" });
  const containerError = submitCount > 0 && (!containerValue || showAccountError);
  const filePatternError = submitCount > 0 && !filePatternValue;

  return (
    <div className="pt-2 space-y-3">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className={cn("text-sm", containerError ? "text-destructive" : "text-foreground")}>Container</Label>
          <Controller
            control={control}
            name="container"
            rules={{ required: true }}
            render={({ field }) => (
              <div className="space-y-1">
                <Select value={field.value || undefined} onValueChange={(v) => field.onChange(v)} disabled={!accountName || accountsQ.isLoading}>
                  <SelectTrigger className={cn("bg-background text-sm w-full")}>
                    <SelectValue placeholder={accountName ? (accountsQ.isLoading ? "Loading..." : "Select container") : "Select account first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {containerOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                    {accountName && containerOptions.length === 0 && !accountsQ.isLoading && (
                      <div className="px-2 py-1 text-xs text-muted-foreground">No containers</div>
                    )}
                  </SelectContent>
                </Select>
                {containerError && (
                  <p className="text-sm text-destructive mt-0.5">{showAccountError ? "Select an account first" : "Container is required"}</p>
                )}
              </div>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label className={cn("text-sm", filePatternError ? "text-destructive" : "text-foreground")}>Name pattern</Label>
          <Controller
            control={control}
            name="filePattern"
            rules={{ required: true }}
            render={({ field }) => (
              <div className="space-y-1">
                <Input {...field} className={cn("bg-background w-full")} placeholder="*invoice*.pdf" />
                {filePatternError && <p className="text-sm text-destructive mt-0.5">Name pattern is required</p>}
              </div>
            )}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-foreground">Look-Back Duration</Label>
        <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
          <Controller
            control={control}
            name="lookBackValue"
            render={({ field }) => (
              <NumberStepper
                value={field.value ? Number(field.value.value) : undefined}
                className="w-16"
                onChange={(v) => field.onChange(v != null ? { value: String(v), label: String(v) } : null)}
                min={1}
                max={365}
                step={1}
                aria-label="Look back value"
              />
            )}
          />
          <Controller
            control={control}
            name="lookBackUnit"
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
      </div>

      <div className="space-y-2">
        <Label className="text-sm text-foreground">File Size</Label>
        <Controller
          control={control}
          name="sizeType"
          render={({ field }) => (
            <Select value={field.value != null ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
              <SelectTrigger className={cn("bg-background text-sm")}>
                <SelectValue placeholder="Minimum" />
              </SelectTrigger>
              <SelectContent>
                {sizeTypeOptions.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />

        <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
          <Controller
            control={control}
            name="sizeValue"
            render={({ field }) => (
              <NumberStepper
                value={field.value ? Number(field.value.value) : undefined}
                className="w-16"
                onChange={(v) => field.onChange(v != null ? { value: String(v), label: String(v) } : null)}
                min={0}
                max={10_000}
                step={1}
                aria-label="File size value"
              />
            )}
          />
          <Controller
            control={control}
            name="sizeUnit"
            render={({ field }) => (
              <Select value={field.value != null ? String(field.value) : undefined} onValueChange={(v) => field.onChange(Number(v))}>
                <SelectTrigger className="bg-background text-sm text-foreground border border-input w-[130px]">
                  <SelectValue placeholder="MB" />
                </SelectTrigger>
                <SelectContent>
                  {sizeUnitOptions.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </div>
  );
}
