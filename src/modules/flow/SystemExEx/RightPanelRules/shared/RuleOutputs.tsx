import React from "react";

import ConnectionDots from "@/components/common/ConnectionDots";
import { InputLabel } from "@/components/common/InputLabel";
import { VALUE_ICONS_MAP } from "@/constants";
import { BuiltInRuleOutputSpec } from "@/modules/flow/services/agent/agentTypes";
import { cn } from "@/utils";

interface RuleOutputsProps {
  outputs: BuiltInRuleOutputSpec[];
  className?: string;
  label?: string;
}

function OutputItem({ node, level }: { node: BuiltInRuleOutputSpec; level: number }) {
  const TypeIcon = VALUE_ICONS_MAP(node.Type.charAt(0).toUpperCase() + node.Type.slice(1));
  return (
    <div className={cn("flex flex-col", level > 0 && "pl-3 relative")}>
      {level > 0 && <span className="absolute left-0 top-0 bottom-0 w-px bg-border" aria-hidden />}
      <div className="flex items-center ">
        <InputLabel as="label" variant="flat" size="sm" className="text-sm px-2 py-0.5 rounded-md bg-muted/10 border border-border/60">
          {node.Key}
        </InputLabel>
        <ConnectionDots className="text-muted-foreground w-3 h-[1px]" />
        <InputLabel as="label" variant="flat" size="sm" className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-muted/5 border border-border/60">
          <TypeIcon className="size-4 text-muted-foreground" />
        </InputLabel>
      </div>
      {node.Description && <p className="text-sm text-muted-foreground mt-1 leading-5">{node.Description}</p>}
      {Array.isArray(node.Children) && node.Children.length > 0 && (
        <div className="mt-2 flex flex-col gap-3">
          {node.Children.map((child) => (
            <OutputItem key={child.Key} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export const RuleOutputs: React.FC<RuleOutputsProps> = ({ outputs, className, label = "Outputs" }) => {
  if (!outputs.length) return null;
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <span className="text-xs font-medium text-sidebar-foreground/90">{label}</span>
      <div className="flex flex-col gap-4">
        {outputs.map((o) => (
          <OutputItem key={o.Key} node={o} level={0} />
        ))}
      </div>
    </div>
  );
};

export default RuleOutputs;
