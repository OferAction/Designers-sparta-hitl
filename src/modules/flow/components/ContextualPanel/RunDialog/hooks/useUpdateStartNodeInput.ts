import { useCallback } from "react";

import { produce } from "immer";

import { Option } from "@/components/ui/input-tag";
import { useFlowStore } from "@/store";

export const useUpdateStartNodeInput = (scope: "run-node" | "run-path") => {
  const onChange = useFlowStore((state) => state.onChange);

  const updateNodeInput = useCallback(
    (inputId: string, value: Option | string) => {
      // Only update inputs for the start node in "run-path" scope
      if (scope !== "run-path") return;

      const targetNode = useFlowStore.getState().nodes.find((node) => node.data.type === "start");

      if (!targetNode) return;

      const newInputs = produce(targetNode.data.inputs, (draft: any[]) => {
        const targetInput = draft.find((inp: any) => inp.id === inputId);
        if (targetInput) {
          if (typeof value === "string") {
            // For simple string values (from File inputs)
            targetInput.value = {
              label: value,
              value: value,
            };
          } else if (Array.isArray(value)) {
            targetInput.value = {
              label: value.toString(),
              value: value.toString(),
            };
          } else {
            // For Option objects
            targetInput.value = value || { label: "", value: "" };
          }
        }
      });

      onChange(targetNode.id, "inputs", newInputs);
    },
    [scope, onChange]
  );

  return updateNodeInput;
};
