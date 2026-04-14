import { SectionTitle } from "../SectionTitle";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { useSelectedNode } from "@/modules/flow/hooks";
import type { NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

export default function DeduplicationAgentSettings() {
  const selectedNode = useSelectedNode<NodeVariant<"agent", "deduplicationAgent">>();
  const onChange = useFlowStore((s) => s.onChange);

  const inputs = selectedNode?.data?.inputs;

  const setThreshold = (val: string) => {
    if (!selectedNode?.id) return;
    const numVal = val === "" ? 0 : Math.max(0, Math.min(100, Number(val)));
    onChange(selectedNode.id, "inputs.threshold", numVal);
  };

  const setKeepOne = (val: boolean) => {
    if (!selectedNode?.id) return;
    onChange(selectedNode.id, "inputs.keep_one_duplicate", val);
  };

  const thresholdValue = inputs?.threshold !== undefined ? Number(inputs.threshold) : 95;
  const keepOneValue = inputs?.keep_one_duplicate ?? false;

  return (
    <SectionContainer>
      <SectionTitle title="Settings" />
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <SectionTitle title="Min similarity threshold (%)" className="text-muted-foreground text-sm" />
          <Input
            type="number"
            className="bg-background w-40"
            value={thresholdValue}
            min={0}
            max={100}
            onChange={(e) => setThreshold(e.target.value)}
          />
        </div>
        <div>
          <SectionTitle
            title="Duplicate handling"
            className="text-muted-foreground font-semibold"
            tooltip="When enabled, the agent adds one representative from each duplicate group to the Unique Items output."
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Keep one copy in Unique Items</span>
            <Switch checked={keepOneValue} onCheckedChange={setKeepOne} />
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
