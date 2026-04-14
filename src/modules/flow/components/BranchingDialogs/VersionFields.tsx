import { useFormContext } from "react-hook-form";

import { FormField } from "./FormField";
import { Input } from "@/components/ui/input";
import { useGetFileQuery } from "@/services";

interface VersionFieldsFormData {
  currentVersion: string;
  willBeVersion: string;
}

export function VersionFields({ fileId = "" }: { fileId?: string }) {
  const { register } = useFormContext<VersionFieldsFormData>();
  const { data: { version } = {} } = useGetFileQuery(fileId);

  const currentVersion = `V${version?.major}.${version?.minor}`;
  const nextVersion = `V${version ? version.major + 1 : 1}.0`;

  return (
    <FormField name="currentVersion" label="Current Version">
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-x-4">
        <Input
          variant="tag"
          id="currentVersion"
          placeholder="e.g., v1.0"
          className="bg-background border-input enabled:hover:border-muted-foreground"
          disabled
          defaultValue={currentVersion}
          {...register("currentVersion")}
        />
        <FormField name="willBeVersion" label="Will become" placeholder="e.g., v2.0" disabled defaultValue={nextVersion} />
      </div>
    </FormField>
  );
}
