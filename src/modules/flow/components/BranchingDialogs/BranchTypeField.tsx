import { Controller, useFormContext } from "react-hook-form";

import { FormField } from "./FormField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/utils";

interface BranchTypeFieldFormData {
  branchType?: string;
}

export const BRANCH_TYPES = [
  { value: "fix", label: "Fix" },
  { value: "feature", label: "Feature" },
  { value: "hotfix", label: "Hot Fix" },
  { value: "release", label: "Release" },
  { value: "experiment", label: "Experiment" },
  { value: "test", label: "Test" },
];

export function BranchTypeField() {
  const { control } = useFormContext<BranchTypeFieldFormData>();

  return (
    <FormField name="branchType" label="Branch Type" required>
      <Controller
        name="branchType"
        control={control}
        rules={{ required: "Please select a branch type" }}
        defaultValue="fix"
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1.5">
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="branchType" className={cn(fieldState.error ? "border-destructive" : "", "bg-background")}>
                <SelectValue placeholder="Select a branch type" />
              </SelectTrigger>
              <SelectContent>
                {BRANCH_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.error && <span className="text-xs text-destructive">{fieldState.error.message}</span>}
          </div>
        )}
      />
    </FormField>
  );
}
