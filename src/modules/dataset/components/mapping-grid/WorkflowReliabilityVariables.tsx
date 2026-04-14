import { InfoIcon } from "@phosphor-icons/react";

import { VariableTag } from "./VariableTag";
import { GTIcon } from "@/lib/icons";
import WithTooltip from "@/components/common/WithTooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type OutputRef = { nodeId: string; outputId: string; key?: string; label?: string; type?: string };

interface WorkflowReliabilityVariablesProps {
  outputs: OutputRef[];
  flagged: string[];
  onToggle: (refKey: string) => void;
  className?: string;
}

export function WorkflowReliabilityVariables({ outputs, flagged, onToggle, className }: WorkflowReliabilityVariablesProps) {
  const empty = outputs.length === 0;

  return (
    <div className={cn(className)}>
      <div className="px-4 py-2 border-muted flex items-center">
        <GTIcon className="size-4 mr-1" />
        <div className="text-base font-medium text-blue-accent">Workflow reliability variables</div>
      </div>

      <div className="px-4 py-2">
        {!empty && (
          <div className="mb-2 flex items-center gap-2">
            <div className="text-xs text-muted-foreground">Select variables to affect reliability</div>
            <WithTooltip
              contentClassName="max-w-64"
              tooltip='All active variables in this list will affect the overall workflow reliable metrics calculation in evaluations. Common practice is to activate only the variables that consider as the "end results".'
              side="top"
            >
              <Button variant="ghost" className="!p-1.5px size-fit text-muted-foreground">
                <InfoIcon className="!size-[13px]" />
              </Button>
            </WithTooltip>
          </div>
        )}

        {empty ? (
          <div className="rounded-lg bg-muted/40  px-4 py-6 text-center">
            <div className="text-sm text-muted-foreground">No connected outputs yet.</div>
            <div className="text-sm text-muted-foreground">Map an output to ground truth to enable reliability evaluation.</div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {outputs.map((o) => {
              const refKey = `${o.nodeId}.${o.outputId}`;
              const isActive = flagged.includes(refKey);
              const label = o.key || o.label || o.outputId;
              return (
                <button onClick={() => onToggle(refKey)} className="cursor-pointer">
                  <VariableTag key={refKey} label={label} isActive={isActive} type={o.type} />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default WorkflowReliabilityVariables;
