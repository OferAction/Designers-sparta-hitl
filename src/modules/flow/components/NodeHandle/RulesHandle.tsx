import { memo, useMemo, useCallback, useEffect } from "react";

import { WarningIcon, FunnelIcon } from "@phosphor-icons/react";
import { Position, useUpdateNodeInternals } from "@xyflow/react";

import { CustomRuleFunnelIcon, FunnelCodeNutIcon as FunnelCodeNut, FunnelNutIcon as FunnelNut } from "@/lib/icons";
import WithTooltip from "@/components/common/WithTooltip";
import NodeHandle from "@/modules/flow/components/NodeHandle";
import {
  BUILT_IN_RULE_HANDLE_PREFIX,
  CUSTOM_RULE_HANDLE_PREFIX,
  isRouteDefault,
  SYSTEM_RULE_HANDLE_PREFIX,
} from "@/modules/flow/SystemExEx/RightPanelRules/shared/utils";
import { Node } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

interface RulesHandleProps {
  data: Node["data"];
  parentNodeId: string;
  nodeSelected?: boolean;
  ref?: React.RefObject<HTMLDivElement>;
}

function RulesHandle({ data, parentNodeId, nodeSelected, ref }: RulesHandleProps) {
  const routeHandles: string[] = (data?.routeHandles as string[]) || [];
  const nodes = useFlowStore((s) => s.nodes);
  const updateNodeInternals = useUpdateNodeInternals();

  const ruleEntries = useMemo(() => {
    const node = nodes.find((n) => n.id === parentNodeId);
    const rules = node?.data?.rules?.non_system_rules;
    return Array.isArray(rules) ? rules : [];
  }, [nodes, parentNodeId]);

  const nameForHandle = useCallback(
    (hid: string): string => {
      if (hid.startsWith(SYSTEM_RULE_HANDLE_PREFIX)) return "System rules";
      if (hid.startsWith(BUILT_IN_RULE_HANDLE_PREFIX)) {
        const ruleId = hid.substring(BUILT_IN_RULE_HANDLE_PREFIX.length);
        const r = ruleEntries.find((r) => r.id === ruleId);
        return r?.name || "Built-in rule";
      }
      if (hid.startsWith(CUSTOM_RULE_HANDLE_PREFIX)) {
        const ruleId = hid.substring(CUSTOM_RULE_HANDLE_PREFIX.length);
        const r = ruleEntries.find((r) => r.id === ruleId);
        return r?.name || "Custom rule";
      }
      return "Rule";
    },
    [ruleEntries]
  );

  // Inform React Flow when dynamic handles list changes so it can register them.
  useEffect(() => {
    if (parentNodeId) {
      updateNodeInternals(parentNodeId);
    }
  }, [parentNodeId, updateNodeInternals, routeHandles.length]);

  return (
    <div ref={ref} className="absolute bottom-0 right-2 flex items-center z-[100]">
      {routeHandles.map((hid) => {
        const isSystem = hid.startsWith(SYSTEM_RULE_HANDLE_PREFIX);
        const isBuiltIn = hid.startsWith(BUILT_IN_RULE_HANDLE_PREFIX);
        const isCustom = !isSystem && !isBuiltIn;
        const isDefault = isRouteDefault(hid, nodes, ruleEntries, parentNodeId);
        const groupClass = isSystem ? "group/system-rule-handle" : isBuiltIn ? "group/builtin-rule-handle" : "group/custom-rule-handle";
        return (
          <WithTooltip key={hid} tooltip={nameForHandle(hid)} delayDuration={100}>
            <div className={"relative flex flex-col items-center justify-center " + groupClass} data-rule-handle-wrapper data-handle-id={hid}>
              <div className="absolute -top-2 pointer-events-none opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-has-[.group\/handle:hover]/system-rule-handle:opacity-0 group-has-[.group\/handle:hover]/custom-rule-handle:opacity-0 group-has-[.group\/handle:hover]/builtin-rule-handle:opacity-0 transition-all duration-150 ease-out flex items-center justify-center">
                {!isDefault &&
                  (isSystem ? (
                    <WarningIcon className="size-2 text-muted-foreground" weight="fill" />
                  ) : isBuiltIn ? (
                    <FunnelIcon className="size-2 text-muted-foreground" weight="fill" />
                  ) : (
                    <CustomRuleFunnelIcon className="size-2 text-muted-foreground" />
                  ))}
                {isDefault &&
                  (isBuiltIn ? (
                    <FunnelNut className="size-2 text-muted-foreground" />
                  ) : isCustom ? (
                    <FunnelCodeNut className="size-2 text-muted-foreground" />
                  ) : null)}
              </div>
              <NodeHandle
                type="source"
                position={Position.Bottom}
                id={hid}
                parentNodeId={parentNodeId}
                data={data}
                nodeSelected={nodeSelected}
                viewOnly={isDefault}
                defaultBuiltInRoute={isBuiltIn && isDefault}
                defaultSystemRoute={isSystem && isDefault}
                defaultCustomRoute={isCustom && isDefault}
              />
            </div>
          </WithTooltip>
        );
      })}
    </div>
  );
}

export default memo(RulesHandle);
