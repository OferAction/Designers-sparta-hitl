import { useMemo } from "react";

import { ToggleLeftIcon, ToggleRightIcon } from "@phosphor-icons/react";
import { useReactFlow } from "@xyflow/react";
import { Controller, useFormContext } from "react-hook-form";

import { useGetNodeOutputFromReferenceId } from "@/modules/flow/hooks/useGetNodeOutput";

import { FileInputRenderer } from "./FileInputRenderer";
import { ContainerWithLabelProps, InputRendererProps } from "./types";
import { FileUpload } from "@/components/common/FileUpload";
import { Combobox } from "@/components/ui/combobox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataLoaderInputs, Node } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

const ContainerWithLabel = ({ children, input }: ContainerWithLabelProps) => {
  const { getNode } = useReactFlow<Node>();
  const node = getNode(input.value.split(".")[0]);
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={input.value} className="text-foreground text-sm font-medium">
        {node?.data.label || input.value.split(".")[0]}.{input.label}
        <span className="font-roboto-mono font-semibold lowercase">({input.type || "String"})</span>
      </Label>
      {children}
    </div>
  );
};

const BOOLEAN_OPTIONS = [
  { label: "True", value: "true", icon: () => <ToggleRightIcon weight="fill" /> },
  { label: "False", value: "false", icon: ToggleLeftIcon },
];

export const InputRenderer = ({ input }: InputRendererProps) => {
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();
  const { getNode } = useReactFlow<Node>();
  const getNodeOutput = useGetNodeOutputFromReferenceId(input.value);
  const nodes = useFlowStore((state) => state.nodes);

  const currentNode = getNode(input.value.split(".")[0]);

  const reference = useMemo(() => {
    const output = getNodeOutput();

    return {
      label: input.label,
      value: input.value,
      type: output?.type,
    };
  }, [getNodeOutput, input]);

  switch (reference.type) {
    case "Boolean":
      return (
        <ContainerWithLabel input={reference}>
          <Controller
            control={control}
            name={reference.value}
            defaultValue={input.inputValue}
            render={({ field }) => (
              <Combobox
                {...field}
                value={BOOLEAN_OPTIONS.find((option) => option.value === field.value?.toString()) || null}
                onChange={(selectedOption) => {
                  const newValue = JSON.parse(selectedOption?.value.toLowerCase() || "false");
                  field.onChange(newValue);
                }}
                options={BOOLEAN_OPTIONS}
              />
            )}
          />
        </ContainerWithLabel>
      );
    case "File": {
      const latestNode = nodes.find((n) => n.id === currentNode?.id);
      const dataLoaderInput = (latestNode?.data?.inputs as DataLoaderInputs[])?.find((inp) => inp.id === input.id);

      if (!dataLoaderInput) return;
      return (
        <ContainerWithLabel input={reference}>
          <div className="relative flex gap-3">
            <div className="self-stretch w-px" />
            <Controller
              control={control}
              name={reference.value}
              defaultValue={dataLoaderInput.value.value || ""}
              rules={{
                validate: (value: string) => {
                  if (typeof value !== "string") return `${reference.label} is invalid`;
                  if (!value) return `${reference.label} is required`;

                  // Check if it's a valid URL
                  const urlRegex = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(:\d+)?(\/[^\s]*)?$/;
                  const isValidUrl = urlRegex.test(value);

                  // Check if it's a valid file path
                  // Must have path separator AND a filename with extension
                  const hasPathSeparator = value.includes("/") || value.includes("\\");
                  const hasFileExtension = /[^/\\]+\.[^/\\]+$/.test(value);
                  const isValidFilePath = hasPathSeparator && hasFileExtension;

                  if (!isValidUrl && !isValidFilePath) {
                    return "Invalid file URL or path";
                  }

                  return true;
                },
              }}
              render={({ field }) => (
                <FileUpload
                  className="py-1.5"
                  input={{
                    ...dataLoaderInput,
                    value: { label: field.value || "", value: field.value || "" },
                  }}
                  hasExternalError={!!errors[reference.value]}
                  onInputValueChange={(_, value) => {
                    const newValue = value.value || "";
                    field.onChange(newValue);
                  }}
                />
              )}
            />
            {errors[reference.value] && <span className="text-sm text-destructive mt-1 block">{errors[reference.value]?.message as string}</span>}
          </div>
        </ContainerWithLabel>
      );
    }
    case "List of Files": {
      return <FileInputRenderer defaultValue={input.inputValue} input={reference} />;
    }
    case "Undefined":
      return (
        <ContainerWithLabel input={reference}>
          <span className="text-xs text-destructive">
            Undefined reference: {input.value.split(".")[0]}.{input.label}
          </span>
        </ContainerWithLabel>
      );
    default:
      return (
        <ContainerWithLabel input={reference}>
          <Input
            id={reference.value}
            variant="tag"
            className="bg-background w-full"
            placeholder="Enter value.."
            defaultValue={input.inputValue || ""}
            {...register(reference.value, {
              required: `${reference.label} is required`,
              valueAsNumber: reference.type === "Number",
            })}
          />
          {errors[reference.value] && (
            <span className="text-sm text-destructive">{errors[reference.value || reference.value]?.message as string}</span>
          )}
        </ContainerWithLabel>
      );
  }
};
