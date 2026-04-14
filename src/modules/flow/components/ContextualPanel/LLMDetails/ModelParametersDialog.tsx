import React, { useState, useMemo } from "react";

import { useSelectedNode } from "@/modules/flow/hooks/useSelectedNode";

import { SliderWithInput } from "@/components/common/slider-with-input";
import { Button } from "@/components/ui/button";
import { Combobox } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NonNullableOption as Option } from "@/components/ui/input-tag";
import { ModelParameters, AgentNodeData, NodeVariant } from "@/modules/flow/types/BaseNodeTypes";
import { useFlowStore } from "@/store";

type Context = {
  hasPermission: (permission: string) => boolean;
};

const DEFAULT_MODEL_OPTIONS: (Option & { provider: string; props?: (ctx: Context) => Record<string, any> })[] = [
  { label: "OpenAI GPT-4.1", value: "gpt-4.1", provider: "azure" },
  { label: "OpenAI GPT-4o", value: "gpt-4o", provider: "azure" },
  { label: "Llama-4", value: "Llama-4-Maverick-17B-128E-Instruct-FP8", provider: "azure_openai" },
  {
    label: "Gemini 3 Pro Preview",
    value: "google/gemini-3-pro-preview",
    provider: "openrouter",
  },
  {
    label: "Gemini 2.5 Flash",
    value: "google/gemini-2.5-flash",
    provider: "openrouter",
    props: (ctx) => ({
      disabled: !ctx.hasPermission("EXCLUSIVE_LLM_MODELS_ACCESS"),
    }),
  },
  {
    label: "Gemini 2.5 Pro",
    value: "google/gemini-2.5-pro",
    provider: "openrouter",
    props: (ctx) => ({
      disabled: !ctx.hasPermission("EXCLUSIVE_LLM_MODELS_ACCESS"),
    }),
  },
  {
    label: "Gemini 3 Pro Preview",
    value: "gemini-3-pro-preview",
    provider: "vertex_ai",
  },
  {
    label: "Anthropic Claude Sonnet 4.5",
    value: "anthropic/claude-sonnet-4.5",
    provider: "openrouter",
    props: (ctx) => ({
      disabled: !ctx.hasPermission("EXCLUSIVE_LLM_MODELS_ACCESS"),
    }),
  },
  {
    label: "GPT-5",
    value: "gpt-5",
    provider: "azure",
    props: (ctx) => ({
      disabled: !ctx.hasPermission("EXCLUSIVE_LLM_MODELS_ACCESS"),
    }),
  },
];

const DEFAULT_SLIDERS = [
  {
    id: "max_tokens-slider",
    key: "max_tokens" as keyof ModelParameters["hyperparameters"],
    label: "Max Tokens",
    min: 1,
    max: 8192,
    step: 1,
    defaultValue: 2048,
  },
  {
    id: "temperature-slider",
    key: "temperature" as keyof ModelParameters["hyperparameters"],
    label: "Temperature",
    min: 0,
    max: 2,
    step: 0.01,
    defaultValue: 0.7,
  },
  {
    id: "top_p-slider",
    key: "top_p" as keyof ModelParameters["hyperparameters"],
    label: "Top P",
    min: 0,
    max: 1,
    step: 0.01,
    defaultValue: 1,
  },
  {
    id: "presence_penalty-slider",
    key: "presence_penalty" as keyof ModelParameters["hyperparameters"],
    label: "Presence Penalty",
    min: -2,
    max: 2,
    step: 0.01,
    defaultValue: 0,
  },
  {
    id: "frequency_penalty-slider",
    key: "frequency_penalty" as keyof ModelParameters["hyperparameters"],
    label: "Frequency Penalty",
    min: -2,
    max: 2,
    step: 0.01,
    defaultValue: 0,
  },
];

interface ModelParametersDialogProps {
  children: React.ReactNode;
}

export function ModelParametersDialog({ children }: ModelParametersDialogProps) {
  const onChange = useFlowStore((state) => state.onChange);
  const selectedNode = useSelectedNode<NodeVariant<"agent", "llmAgent">>();
  const [open, setOpen] = useState(false);

  const initialParameters = useMemo<ModelParameters>(() => {
    if (!selectedNode) {
      return {
        model: DEFAULT_MODEL_OPTIONS[0].value,
        provider: DEFAULT_MODEL_OPTIONS[0].provider,
        hyperparameters: {},
      };
    }
    const nodeData = selectedNode.data as AgentNodeData;
    const modelParams = (nodeData.inputs?.model_parameters || {}) as Partial<ModelParameters>;
    const model = modelParams.model || DEFAULT_MODEL_OPTIONS[0].value;
    const provider = modelParams.provider || DEFAULT_MODEL_OPTIONS.find((opt) => opt.value === model)?.provider || DEFAULT_MODEL_OPTIONS[0].provider;
    return {
      model,
      provider,
      hyperparameters: modelParams.hyperparameters || {},
    };
  }, [selectedNode]);

  const [parameters, setParameters] = useState<ModelParameters>(initialParameters);

  // Re-initialize when dialog is opened
  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setParameters(initialParameters);
    }
  };

  const selectedModel = DEFAULT_MODEL_OPTIONS.find((option) => option.value === parameters.model) || null;

  const handleParameterChange = (key: string, value: number) => {
    setParameters((prev) => ({
      ...prev,
      hyperparameters: {
        ...prev.hyperparameters,
        [key]: value,
      },
    }));
  };
  const handleModelChange = (option: Option | null) => {
    if (option) {
      const modelOption = DEFAULT_MODEL_OPTIONS.find((opt) => opt.value === option.value);
      setParameters((prev) => ({
        ...prev,
        model: option.value,
        provider: modelOption?.provider || prev.provider,
      }));
    }
  };
  const handleSave = () => {
    if (!selectedNode) return;

    const currentInputs = (selectedNode.data as AgentNodeData).inputs || {};

    onChange(selectedNode.id, "inputs", {
      ...currentInputs,
      model_parameters: parameters,
    });

    setOpen(false);
  };
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="w-full bg-background/95 text-foreground border-border rounded-lg" style={{ overflow: "visible" }}>
        <div className="flex justify-between items-center my-6">
          <DialogTitle className="text-xl font-semibold">Model parameters</DialogTitle>
          <div className="relative w-full max-w-[250px] ml-auto">
            <Combobox options={DEFAULT_MODEL_OPTIONS} value={selectedModel} onChange={handleModelChange} placeholder="Select model" />
          </div>
        </div>

        <div className="space-y-1 mx-12">
          {DEFAULT_SLIDERS.map((slider) => (
            <SliderWithInput
              key={slider.id}
              label={slider.label}
              value={parameters.hyperparameters?.[slider.key] ?? slider.defaultValue}
              onChange={(value) => handleParameterChange(slider.key, value)}
              min={slider.min}
              max={slider.max}
              step={slider.step}
            />
          ))}
        </div>

        <div className="border-t border-border -mx-6 mb-3"></div>

        <DialogFooter className="flex flex-row justify-between gap-4 px-0 py-0">
          <Button variant="outline" onClick={() => setOpen(false)} className="mr-auto bg-background/30 border-border/50 hover:bg-background/50">
            Cancel
          </Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
