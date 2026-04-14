import { Controller, useFormContext } from "react-hook-form";

import { FormField } from "./FormField";
import { MultiSelect } from "@/components/ui/multi-select";
import { useGetUsersQuery } from "@/services/securityService";
import { useAuthStore } from "@/store/authStore";

interface OwnerFieldFormData {
  owner: string[];
}

export function OwnerField() {
  const { control } = useFormContext<OwnerFieldFormData>();

  const { data, isSuccess } = useGetUsersQuery();
  const options = data?.map((user) => ({ label: user.name, value: user.externalId || user.id })) || [];
  const currentUser = useAuthStore((state) => state.user!);
  const defaultValue = options.find((option) => option.value === currentUser.id)?.value;

  return (
    <FormField name="owner" label="Owner" required disabled>
      <Controller
        name="owner"
        control={control}
        defaultValue={defaultValue ? [defaultValue] : []}
        render={({ field }) => (
          <MultiSelect
            id="owner"
            options={isSuccess ? options : []}
            onValueChange={(vals) => {
              field.onChange(vals);
            }}
            placeholder="Select owner(s)"
            variant="secondary"
            className="bg-background border-input"
            defaultValue={field.value ?? []}
            resetOnDefaultValueChange={false}
            modalPopover={false}
            disabled
          />
        )}
      />
    </FormField>
  );
}
