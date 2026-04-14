import type { Edge, Node, RuleEntry } from "@/modules/flow/types";
import { useFlowStore } from "@/store";

import type { EdgeChange } from "@xyflow/system";

export const SYSTEM_RULE_HANDLE_PREFIX = "system_rules_route_";
export const BUILT_IN_RULE_HANDLE_PREFIX = "built_in_rule_";
export const CUSTOM_RULE_HANDLE_PREFIX = "custom_rule_";

// Deterministic per-node system rule handle id so each node has its own stable handle.
export function systemRuleHandleId(nodeId: string): string {
  return `${SYSTEM_RULE_HANDLE_PREFIX}${nodeId}`;
}

export function ensureSystemRuleHandleId(nodeId: string, current?: string): string {
  const desired = systemRuleHandleId(nodeId);
  if (current === desired) return current;
  if (current && current.startsWith(SYSTEM_RULE_HANDLE_PREFIX)) return desired;
  return desired;
}

// Deterministic handle id for a built-in rule (per node + rule id)
export function builtInRuleHandleId(ruleId: string) {
  return `${BUILT_IN_RULE_HANDLE_PREFIX}${ruleId}`;
}

export function customRuleHandleId(ruleId: string) {
  return `${CUSTOM_RULE_HANDLE_PREFIX}${ruleId}`;
}

function findEdgeByHandlePrefix(edges: Edge[], nodeId: string, prefix: string, handleId?: string) {
  if (!nodeId) return undefined as Edge | undefined;
  const hid = handleId || "";
  return edges.find((e: any) => e.source === nodeId && e.sourceHandle && (e.sourceHandle === hid || e.sourceHandle.startsWith(prefix)));
}

export function resolveBuiltInRuleTargetNode(nodes: Node[], edges: Edge[], nodeId: string, handleId?: string): Node | undefined {
  const edge = findEdgeByHandlePrefix(edges as any, nodeId, BUILT_IN_RULE_HANDLE_PREFIX, handleId);
  return edge ? nodes.find((n) => n.id === edge.target) : undefined;
}

export function upsertRouteHandles(routeHandles: string[] | undefined, newHandle: string): string[] {
  const arr = Array.isArray(routeHandles) ? routeHandles : [];
  if (arr.includes(newHandle)) return arr;
  return [newHandle, ...arr];
}

// Open the System Rules configuration in the left panel
export function openSystemRulesConfiguration() {
  const { setLeftPanelActiveItem } = useFlowStore.getState();
  setLeftPanelActiveItem("systemRules");
}

export function pruneRuleHandleEdges(nodeId: string, handleId?: string) {
  const { edges, onEdgesChange } = useFlowStore.getState();
  const toRemove: Edge[] = edges.filter(
    (e) => e.source === nodeId && e.sourceHandle && (handleId ? e.sourceHandle === handleId : e.sourceHandle.startsWith(BUILT_IN_RULE_HANDLE_PREFIX))
  );
  if (!toRemove.length) return;
  const removalChanges: EdgeChange<Edge>[] = toRemove.map((e) => ({ id: e.id, type: "remove" }) as EdgeChange<Edge>);
  onEdgesChange(removalChanges);
}

/**
 * Handle default routing toggle for rules.
 * When enabling default routing, prunes manual edges and sets the rule to use the default route.
 * When disabling, sets the rule to use its own handle for manual routing.
 */
export function handleDefaultRoutingChange<T extends { isDefault?: boolean; route?: string }>(
  isEnabled: boolean,
  params: {
    selectedNodeId: string | undefined;
    ruleHandleId: string;
    handlePrefix: string;
    defaultRoute: string;
    currentAction?: string;
    onChange: (update: Partial<T>) => void;
  }
): void {
  const { selectedNodeId, ruleHandleId, handlePrefix, currentAction, onChange } = params;

  if (isEnabled) {
    // Switching to default routing: remove any manual rule edges
    if (selectedNodeId) {
      const { edges, onEdgesChange } = useFlowStore.getState();
      const toRemove = edges.filter(
        (e) => e.source === selectedNodeId && e.sourceHandle && (e.sourceHandle === ruleHandleId || e.sourceHandle.startsWith(handlePrefix))
      );
      if (toRemove.length) {
        onEdgesChange(toRemove.map((e) => ({ id: e.id, type: "remove" })));
      }
    }
    onChange({ isDefault: true, route: undefined } as Partial<T>);
  } else {
    onChange({ isDefault: false, route: currentAction === "route" ? ruleHandleId : undefined } as Partial<T>);
  }
}

export const isRouteDefault = (handleId: string, nodes: Node[], ruleEntries: RuleEntry[], parentNodeId: string): boolean => {
  if (handleId.startsWith(SYSTEM_RULE_HANDLE_PREFIX)) {
    const node = nodes.find((n) => n.id === parentNodeId);
    return !!node?.data?.rules?.isDefault;
  }

  if (handleId.startsWith(BUILT_IN_RULE_HANDLE_PREFIX)) {
    const ruleId = handleId.substring(BUILT_IN_RULE_HANDLE_PREFIX.length);
    const rule = ruleEntries.find((r) => r.id === ruleId);
    return !!rule?.isDefault && rule?.action_on_execution === "route";
  }

  if (handleId.startsWith(CUSTOM_RULE_HANDLE_PREFIX)) {
    const ruleId = handleId.substring(CUSTOM_RULE_HANDLE_PREFIX.length);
    const rule = ruleEntries.find((r) => r.id === ruleId);
    return !!rule?.isDefault && rule?.action_on_execution === "route";
  }

  return false;
};

export const isHandleDefaultRule = (handleId: string | undefined, nodes: Node[], parentNodeId: string): boolean => {
  if (!handleId) return false;

  const node = nodes.find((n) => n.id === parentNodeId);
  const rules = node?.data?.rules?.non_system_rules || [];

  return isRouteDefault(handleId, nodes, rules, parentNodeId);
};
