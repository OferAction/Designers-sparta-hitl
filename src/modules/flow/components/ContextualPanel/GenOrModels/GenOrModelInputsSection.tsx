import { useCallback } from "react";

import { KwargsEditor } from "./KwargsEditor";
import { AncestorInputSelect } from "../shared/AncestorInputSelect";
import { Option } from "@/components/ui/input-tag";
import { Label } from "@/components/ui/label";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant, GenOrModelInputs, GenOrModelType } from "@/modules/flow/types/BaseNodeTypes";
import { useFlowStore } from "@/store";

export const GenOrModelInputsSection = () => {
  const selectedNode = useSelectedNode<NodeVariant<"agent", "genOrModel">>();
  const selectedNodeId = selectedNode?.id;
  const onChange = useFlowStore((state) => state.onChange);
  const currentInputs = selectedNode?.data?.inputs;
  const modelInputs = currentInputs?.model_inputs || [];
  const callKwargs = currentInputs?.call_kwargs || "";
  const initKwargs = currentInputs?.init_kwargs || "";

  const handleInputChange = useCallback(
    (inputId: string, selectedInput: Option) => {
      if (!selectedNodeId) return;

      const modelInputs = selectedNode?.data?.inputs.model_inputs;

      const updatedModelInputs = modelInputs.map((input: GenOrModelInputs) => {
        if (input.id === inputId) {
          if (!selectedInput) {
            return { ...input, value: null };
          }

          const { icon: _, ...newOption } = selectedInput;
          return { ...input, value: newOption };
        }
        return input;
      });

      const newInputs = {
        ...currentInputs,
        model_inputs: updatedModelInputs,
      };

      onChange(selectedNodeId, "inputs", newInputs);
    },
    [selectedNodeId, selectedNode?.data?.inputs, currentInputs, onChange]
  );

  const handleCallKwargsChange = useCallback(
    (value: string) => {
      if (!selectedNodeId) return;

      const currentInputs = selectedNode?.data?.inputs || ({} as GenOrModelType["inputs"]);

      const newInputs = {
        ...currentInputs,
        call_kwargs: value,
      };

      onChange(selectedNodeId, "inputs", newInputs);
    },
    [selectedNodeId, selectedNode?.data?.inputs, onChange]
  );

  const handleInitKwargsChange = useCallback(
    (value: string) => {
      if (!selectedNodeId) return;

      const currentInputs = selectedNode?.data?.inputs || ({} as GenOrModelType["inputs"]);

      const newInputs = {
        ...currentInputs,
        init_kwargs: value,
      };

      onChange(selectedNodeId, "inputs", newInputs);
    },
    [selectedNodeId, selectedNode?.data?.inputs, onChange]
  );

  if (!selectedNode || !selectedNodeId) {
    return null;
  }

  return (
    <>
      <SectionContainer>
        {/* Inputs Section */}
        <SectionTitle title="Inputs" />
        <div className="flex flex-col gap-4">
          {modelInputs.map((input: GenOrModelInputs) => {
            const currentValue = input.value?.value || "";

            return (
              <div key={input.id} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <Label className="text-sm font-medium text-sidebar-foreground">{input.key}</Label>
                  <span className="text-sm text-muted-foreground font-roboto-mono">{input.type}</span>
                </div>
                <span className="text-sm text-muted-foreground mb-1">{input.description}</span>
                <AncestorInputSelect
                  selectedNodeId={selectedNodeId}
                  currentValue={currentValue}
                  onValueChange={(ancestorOption) => handleInputChange(input.id, ancestorOption)}
                  placeholder="Select variable"
                />
              </div>
            );
          })}
        </div>
      </SectionContainer>
      <SectionContainer>
        <KwargsEditor title="Init kwargs" value={initKwargs} onChange={handleInitKwargsChange} />
      </SectionContainer>
      <SectionContainer>
        <KwargsEditor title="Call kwargs" value={callKwargs} onChange={handleCallKwargsChange} />
      </SectionContainer>
    </>
  );
};
