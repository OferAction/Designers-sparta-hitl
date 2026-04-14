import { useMemo } from "react";

import { FunnelIcon } from "@phosphor-icons/react";

import { CustomRuleFunnelIcon } from "@/lib/icons";
import { VALUE_ICONS_MAP } from "@/constants";
import { useAncestors } from "@/modules/flow/hooks";
import { AncestorValueOption } from "@/modules/flow/types";

export const useAncestorValueOptions = (nodeId?: string) => {
  const ancestors = useAncestors(nodeId || "");
  return useMemo(
    () =>
      ancestors.map((ancestor) => {
        const regularOutputs: AncestorValueOption[] = [];
        const ruleOutputsMap = new Map<string, { name: string; outputs: AncestorValueOption[]; order: number; type: "built-in" | "custom" }>();

        ancestor.data.outputs.forEach((output) => {
          // Check if output has rule metadata (added by useAncestors)
          if ("ruleId" in output && "ruleName" in output && output.ruleId && output.ruleName) {
            // Initialize rule group if not exists
            if (!ruleOutputsMap.has(output.ruleId)) {
              ruleOutputsMap.set(output.ruleId, {
                name: output.ruleName,
                order: output.ruleOrder || 0,
                type: output.ruleType || "built-in",
                outputs: [],
              });
            }

            ruleOutputsMap.get(output.ruleId)!.outputs.push({
              id: output.id,
              key: output.key,
              label: output.key,
              value: output.id,
              keywords: [ancestor.id, output.key, output.ruleName],
              type: output.type,
              icon: VALUE_ICONS_MAP(output.type),
              isReference: true,
              description: output.description,
              RuleId: output.ruleId,
              RuleName: output.ruleName,
            });
          } else {
            // Regular output
            regularOutputs.push({
              id: output.id,
              key: output.key,
              label: output.key,
              value: `${ancestor.id}.${output.id}`,
              keywords: [ancestor.id, output.key, `${ancestor.id}.${output.id}`],
              type: output.type,
              icon: VALUE_ICONS_MAP(output.type),
              isReference: true,
              description: "description" in output ? output.description : undefined,
            });
          }
        });

        // Convert rule outputs map to sorted groups
        const ruleGroups = Array.from(ruleOutputsMap.entries())
          .map(([ruleId, data]) => ({
            label: data.name,
            value: `${ancestor.id}_rule_${ruleId}`,
            type: "group",
            icon: data.type === "custom" ? CustomRuleFunnelIcon : FunnelIcon,
            children: data.outputs,
            order: data.order,
          }))
          .sort((a, b) => a.order - b.order);

        return {
          label: ancestor.data.label || ancestor.id,
          value: ancestor.id,
          children: [...regularOutputs, ...ruleGroups],
        };
      }),
    [ancestors]
  );
};

export default useAncestorValueOptions;
