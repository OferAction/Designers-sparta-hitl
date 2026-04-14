import { Controller, useFormContext } from "react-hook-form";

import { FormField } from "./FormField";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGetBranches } from "@/modules/flow/services";
import { cn } from "@/utils";

interface SourceBranchFieldFormData {
  sourceBranch?: {
    label: string;
    value: string;
  };
}

export function SourceBranchField({ id }: { id: string }) {
  const { control } = useFormContext<SourceBranchFieldFormData>();
  const { data: branches } = useGetBranches(id);

  const filteredBranches = branches?.filter((branch) => branch.id !== id) || [];

  return (
    <FormField name="sourceBranch" label="Source Branch" required>
      <Controller
        name="sourceBranch"
        control={control}
        rules={{ required: "Please select a source branch" }}
        render={({ field, fieldState }) => (
          <div className="flex flex-col gap-1.5">
            <Select
              value={field.value?.value}
              onValueChange={(value) => {
                const selectedBranch = filteredBranches.find((b) => b.id === value);
                if (selectedBranch) {
                  field.onChange({
                    label: selectedBranch.name,
                    value: selectedBranch.id,
                  });
                }
              }}
            >
              <SelectTrigger id="sourceBranch" className={cn(fieldState.error ? "border-destructive" : "", "bg-background")}>
                <SelectValue placeholder="Select a branch" />
              </SelectTrigger>
              <SelectContent>
                {filteredBranches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
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
