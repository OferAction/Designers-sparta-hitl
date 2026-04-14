import { useFormContext } from "react-hook-form";

import { useUpdateStartNodeInput } from "./useUpdateStartNodeInput";
import { NonNullableOption } from "@/components/ui/input-tag";

export const usePopulateFormFromData = (inputs: NonNullableOption[] | null, scope: "run-node" | "run-path") => {
  const { setValue } = useFormContext();
  const updateStartNodeInput = useUpdateStartNodeInput(scope);

  const populateFormFromData = (data: Record<string, any>) => {
    if (!inputs) return;

    Object.entries(data).forEach(([inputLabel, inputValue]) => {
      const matchingInput = inputs.find((input) => `${input.label}`.toLowerCase() === inputLabel.toLowerCase());

      if (!matchingInput) return;

      const parts = String(matchingInput.value).split(".");
      const nodeId = parts[0];
      const inputId = parts[1];

      if (!nodeId || !inputId) return;

      switch (matchingInput.type) {
        case "Boolean": {
          const boolValue = typeof inputValue === "boolean" ? inputValue : inputValue === "true";
          setValue(matchingInput.value, boolValue, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
          updateStartNodeInput(inputId, boolValue.toString());
          break;
        }
        case "File":
          setValue(matchingInput.value, inputValue, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
          updateStartNodeInput(inputId, inputValue);
          break;
        case "List of Files": {
          const values = Array.isArray(inputValue) ? inputValue : [inputValue];

          setValue(
            matchingInput.value,
            {
              value: values,
              type: "File",
            },
            { shouldValidate: true, shouldDirty: true, shouldTouch: true }
          );
          updateStartNodeInput(inputId, {
            label: values[0] ? String(values[0]) : "",
            value: values[0] ? String(values[0]) : "",
          });
          break;
        }
        case "Number": {
          const numValue = typeof inputValue === "number" ? inputValue : parseFloat(inputValue) || 0;
          setValue(matchingInput.value, numValue, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true,
          });
          updateStartNodeInput(inputId, numValue.toString());
          break;
        }
        default:
          setValue(matchingInput.value, String(inputValue), { shouldValidate: true, shouldDirty: true, shouldTouch: true });
          updateStartNodeInput(inputId, String(inputValue));
          break;
      }
    });
  };

  return { populateFormFromData };
};
