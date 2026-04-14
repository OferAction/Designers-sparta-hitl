import { useEffect } from "react";

import { CheckCircleIcon } from "@phosphor-icons/react";
import { Controller, useFormContext } from "react-hook-form";

import { ContainerWithLabelProps, FileInputRendererProps } from "./types";
import { ControlledFileInput } from "@/components/common/ControlledFileInput";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useUploadFile } from "@/services";
import { cn } from "@/utils";

const ContainerWithLabel = ({ children, input }: ContainerWithLabelProps) => {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={input.value} className="text-foreground text-sm font-medium">
        {input.value.split(".")[0]}.{input.label}
        <span className="font-roboto-mono font-semibold lowercase">({input.type || "String"})</span>
      </Label>
      {children}
    </div>
  );
};

export const FileInputRenderer = ({ input, onChange: propsOnChange, defaultValue: propDefaultValue }: FileInputRendererProps) => {
  const { control, watch, trigger } = useFormContext();
  const { mutate: uploadFile, progress, reset: resetUpload } = useUploadFile();

  useEffect(() => {
    trigger(input.value);

    return () => {
      resetUpload();
    };
  }, [resetUpload, trigger, input.value]);

  const inputValue = watch(input.value);

  const defaultValue = {
    value: propDefaultValue ? [propDefaultValue] : [],
  };

  return (
    <ContainerWithLabel input={input}>
      <Controller
        control={control}
        name={input.value}
        defaultValue={defaultValue}
        rules={{
          validate: (value) => {
            console.log("Validating file:", value);
            if (!value || !value.value || value.value.length === 0) {
              return "File is required";
            }
            return true;
          },
        }}
        render={({ field: { onChange, value } }) => (
          <div>
            <ControlledFileInput
              id={input.value}
              className={cn("bg-background w-full px-3 py-2", inputValue?.value?.length && "text-foreground")}
              data={value}
              onChange={(value) => {
                onChange(value);
                propsOnChange?.(value?.value);
              }}
              onClear={resetUpload}
              directory={input.type === "List of Files" ? "" : undefined}
              webkitdirectory={input.type === "List of Files" ? "" : undefined}
              label={input.type === "List of Files" ? "Choose Directory" : "Choose File"}
              onFileUpload={(files) => {
                uploadFile(
                  { files: Array.from(files) },
                  {
                    onSuccess: (data) => {
                      onChange({
                        value: data,
                        type: "File",
                      });
                      propsOnChange?.(data);
                    },
                  }
                );
              }}
            />
            {progress.some((progress) => progress > 0) && (
              <div className="mt-1">
                {progress.every((p) => p === 100) ? (
                  inputValue?.value && (
                    <div className="flex items-center gap-2 text-green-500">
                      <CheckCircleIcon size={20} weight="fill" />
                      <span className="text-sm font-medium">Uploaded successfully</span>
                    </div>
                  )
                ) : (
                  <Progress value={progress.reduce((acc, curr) => acc + curr, 0) / progress.length} className="h-1" />
                )}
              </div>
            )}
          </div>
        )}
      />
    </ContainerWithLabel>
  );
};
