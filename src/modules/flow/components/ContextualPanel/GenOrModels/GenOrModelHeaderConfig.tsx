import { useCallback, useState } from "react";

import { PlugIcon } from "@phosphor-icons/react";

import { InputLabel } from "@/components/common/InputLabel";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Option } from "@/components/ui/input-tag/old-deprecated/InputTag/types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant } from "@/modules/flow/types/BaseNodeTypes";
import { useFlowStore } from "@/store";

const modelOptions: Option[] = [
  { value: "donut", label: "Donut" },
  { value: "layoutLM", label: "LayoutLM" },
  { value: "yolo", label: "Yolo" },
  { value: "vit", label: "Vit" },
  { value: "llmJudge", label: "LLM Judge" },
];

export const GenOrModelHeaderConfig = () => {
  const [open, setOpen] = useState(false);
  const selectedNode = useSelectedNode<NodeVariant<"agent", "genOrModel">>();
  const selectedNodeId = selectedNode?.id;
  const onChange = useFlowStore((state) => state.onChange);

  const currentModelId = selectedNode?.data?.inputs?.model_id || "";

  const handleModelSelect = useCallback(
    (modelId: string) => {
      if (!selectedNodeId) return;

      const currentInputs = selectedNode?.data?.inputs || {};

      const newInputs = {
        ...currentInputs,
        model_id: modelId,
      };

      onChange(selectedNodeId, "inputs", newInputs);
      setOpen(false);
    },
    [selectedNodeId, onChange, selectedNode?.data?.inputs]
  );
  
  const getSelectedModelLabel = () => {
    const selectedModel = modelOptions.find((option) => option.value === currentModelId);
    return selectedModel?.label || "Model";
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div>
          <InputLabel variant={open ? "active" : "emphasized"} size="sm" icon={<PlugIcon weight="fill" size={16} />} value={getSelectedModelLabel()} />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[150px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search..." />
          <CommandEmpty>No models found.</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {modelOptions.map((model) => (
                <CommandItem
                  key={model.value}
                  value={model.value}
                  onSelect={() => handleModelSelect(model.value)}
                >
                  <span>{model.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
