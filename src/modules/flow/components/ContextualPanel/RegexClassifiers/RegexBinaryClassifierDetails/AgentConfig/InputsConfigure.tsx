import { useAncestorValueOptions } from "@/modules/flow/hooks/useAncestorValueOptions";

import {
  CopyButton,
  ExpandButton,
  Terminal,
  TerminalContent,
  TerminalControls,
  TerminalHeader,
  TerminalTitle,
} from "@/components/common/CodeTerminal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DynamicAreaList from "@/modules/flow/components/ContextualPanel/RegexClassifiers/RegexBinaryClassifierDetails/DynamicList/DynamicAreaList";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { DynamicField } from "@/modules/flow/components/IO";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant, RegexBinaryClassifierInput } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

const relevantMatchOptions = [
  { value: "Any", label: "Any" },
  { value: "First", label: "First" },
  { value: "Last", label: "Last" },
];

const InputsConfigure = () => {
  const onChange = useFlowStore((state) => state.onChange);
  const selectedNode = useSelectedNode<NodeVariant<"agent", "regexBinaryClassifier">>();
  const selectedNodeId = selectedNode?.id;
  const valueOptions = useAncestorValueOptions(selectedNodeId);

  let input: RegexBinaryClassifierInput | undefined = undefined;
  if (selectedNode && typeof selectedNode === "object" && "data" in selectedNode && selectedNode.data && "inputs" in selectedNode.data) {
    input = selectedNode.data.inputs as RegexBinaryClassifierInput;
  }

  return (
    <SectionContainer>
      <SectionTitle title="Binary Classification" />
      <div className="flex flex-col gap-3">
        <div>
          <Terminal value={input?.data || ""} variant="input" className="h-full flex flex-1 bg-sidebar border-none">
            <TerminalHeader className="px-0 flex items-center border-none">
              <TerminalTitle>
                Text to classify <span className="text-muted-foreground -mt-1"> *</span>
              </TerminalTitle>
              <TerminalControls>
                <ExpandButton />
                <CopyButton value={input?.data || ""} />
              </TerminalControls>
            </TerminalHeader>
            <TerminalContent>
              <DynamicField
                value={input?.data || ""}
                placeholder="Enter text, type @ to insert variables"
                className="h-10 rounded-md mt-1 border-input border overflow-hidden"
                onChange={(value) => {
                  if (!selectedNode) return;
                  onChange(selectedNode.id, "inputs.data", value);
                }}
                scope={valueOptions}
              />
            </TerminalContent>
          </Terminal>
        </div>
        <div>
          <Label className="flex mb-1 text-sm font-medium text-foreground gap-2">
            Regex Patterns <span className="text-muted-foreground flex -mt-1"> *</span>
          </Label>
          <DynamicAreaList
            value={input?.regex_patterns || []}
            valueOptions={valueOptions}
            onChange={(value: { id: string; value: any }[]) => {
              if (selectedNode) {
                onChange(selectedNode.id, "inputs.regex_patterns", value);
              }
            }}
          />
        </div>
        <div>
          <Label className="flex mb-1 text-sm font-medium text-foreground gap-2">Unwanted Regex Patterns</Label>
          <DynamicAreaList
            value={input?.unwanted_regex_patterns || []}
            valueOptions={valueOptions}
            onChange={(value: { id: string; value: any }[]) => {
              if (selectedNode) {
                onChange(selectedNode.id, "inputs.unwanted_regex_patterns", value);
              }
            }}
          />
        </div>
        <div>
          <Label className="flex mb-1 text-sm font-medium text-foreground gap-2">Relevant Match</Label>
          <Select
            value={input?.relevant_match || ""}
            onValueChange={(value) => {
              if (!selectedNode) return;
              onChange(selectedNode.id, "inputs.relevant_match", value);
            }}
          >
            <SelectTrigger className="w-[115px] bg-background border border-border rounded-md">
              <SelectValue placeholder="Select match option" />
            </SelectTrigger>
            <SelectContent>
              {relevantMatchOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="flex mb-1 text-sm font-medium text-foreground gap-2">Context Range</Label>
          <Input
            type="number"
            inputMode="numeric"
            pattern="[0-9]*"
            value={input?.context_range}
            onChange={(e) => {
              if (!selectedNode) return;
              if (isNaN(e.target.valueAsNumber)) return;
              onChange(selectedNode.id, "inputs.context_range", e.target.valueAsNumber);
            }}
            placeholder="Enter a number"
            className="w-full bg-background border border-border rounded-md [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{ MozAppearance: "textfield" }}
          />
        </div>
      </div>
    </SectionContainer>
  );
};

export default InputsConfigure;
