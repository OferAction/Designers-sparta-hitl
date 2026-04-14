import React, { useCallback, useMemo, useState } from "react";

import { QuestionIcon } from "@phosphor-icons/react";
import { useUpdateNodeInternals } from "@xyflow/react";
import { useParams } from "react-router-dom";

import { useRemoveRouteHandle } from "./useRemoveRouteHandle";
import BuiltInRuleItem from "../built-in/BuiltInRuleItem";
import CustomRuleItem from "../custom/CustomRuleItem";
import { builtInRuleHandleId, customRuleHandleId, SYSTEM_RULE_HANDLE_PREFIX } from "../shared/utils";
import { GenOrModelIcon } from "@/lib/icons";
import WithTooltip from "@/components/common/WithTooltip";
import DragHandle from "@/modules/flow/components/ContextualPanel/shared/DragHandle";
import { useSelectedNode } from "@/modules/flow/hooks";
import type { TemplateBuiltInRule } from "@/modules/flow/services/agent/agentTypes";
import type { RuleEntry, RuleSetting } from "@/modules/flow/types/BaseNodeTypes";
import { useGetFileRoutingConfig } from "@/services/fileService/fileService";
import { useFlowStore } from "@/store";

import { computeInsertAt, finalizeOrder, indexOfById, reorderWithInsert } from "@/modules/flow/components/ContextualPanel/shared/utils/drag";

import type { BuiltInRuleModel } from "../built-in/builtInRulesTypes";

interface Props {
  agentBuiltIns: TemplateBuiltInRule[];
  autoFocusRuleId?: string | null;
}

export default function UnifiedRulesList({ agentBuiltIns, autoFocusRuleId }: Props) {
  const onChange = useFlowStore((s) => s.onChange);
  const { fileId = "" } = useParams();
  const { data: routingConfig } = useGetFileRoutingConfig(fileId);

  const defaultAgenticRoute = routingConfig?.defaultAgenticRoute || "";
  const agenticRoutingEnabled = !!routingConfig?.agenticRoutingEnabled;
  const defaultCustomRoute = routingConfig?.defaultCustomRoute || "";
  const customRoutingEnabled = !!routingConfig?.customRoutingEnabled;

  const updateNodeInternals = useUpdateNodeInternals();
  const removeRouteHandle = useRemoveRouteHandle();
  const node = useSelectedNode();
  const selectedNodeId = node?.id;
  const data = node?.data;
  const stored: RuleEntry[] = useMemo(() => {
    const rulesCfg = data?.rules;
    return Array.isArray(rulesCfg?.non_system_rules) ? rulesCfg.non_system_rules : [];
  }, [data?.rules]);

  const mergedWithMissing: RuleEntry[] = useMemo(() => {
    // stored is non system rules = built-in + custom that are in the node
    if (!agentBuiltIns?.length) return stored;
    // get ids of built-in rules that are in the node
    const existingIds = new Set(stored.filter((r) => r.type === "built-in").map((r) => r.id));
    // find the missing ones
    const missing = agentBuiltIns.filter((b) => !existingIds.has(b.Id));
    if (!missing.length) return stored;
    const baseOrder = Math.min(...stored.map((r) => r.order || 0), 0) - missing.length;
    const appended: RuleEntry[] = missing.map((m, i) => ({
      id: m.Id,
      name: m.RuleName || m.Id,
      type: "built-in",
      action_on_execution: "terminate",
      terminate_on_fail: false,
      enabled: false,
      order: baseOrder + i,
    }));
    return [...stored, ...appended];
  }, [agentBuiltIns, stored]);

  const ordered: RuleEntry[] = useMemo(() => mergedWithMissing.slice().sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [mergedWithMissing]);

  const [dragId, setDragId] = useState<string | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const indexOf = useCallback((id: string) => indexOfById(ordered, id), [ordered]);

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    setDragId(id);
  };
  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragId) return;
    const overIdx = indexOf(id);
    const fromIdx = indexOf(dragId);
    const nextInsert = computeInsertAt(e, overIdx, fromIdx);
    setInsertAt(nextInsert);
  };
  const endDrag = () => {
    setDragId(null);
    setInsertAt(null);
  };
  const finalize = (nextList: RuleEntry[]) => {
    if (!selectedNodeId) return;
    const nextEntries = finalizeOrder(nextList);
    onChange(selectedNodeId, "rules", { ...(data?.rules || {}), non_system_rules: nextEntries });

    const prevHandles: string[] = Array.isArray(data?.routeHandles) ? data?.routeHandles : [];
    const systemHandle = prevHandles.find((h) => h.startsWith(SYSTEM_RULE_HANDLE_PREFIX));
    const desired = nextEntries
      .filter(({ action_on_execution }) => action_on_execution === "route")
      .map(({ id, type }) => (type === "built-in" ? builtInRuleHandleId(id) : customRuleHandleId(id)));
    // Preserve existing desired handles order; append new ones. Removed ones are handled earlier in update/remove handlers.
    const preserved = prevHandles.filter((handle) => desired.includes(handle));
    const newOnes = desired.filter((handle) => !preserved.includes(handle));
    const nextHandles = [...preserved, ...newOnes, ...(systemHandle ? [systemHandle] : [])];
    if (nextHandles.join("|") !== prevHandles.join("|")) {
      onChange(selectedNodeId, "routeHandles", nextHandles);
      updateNodeInternals(selectedNodeId);
    }
  };
  const handleDrop = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!dragId) return;
    const from = indexOf(dragId);
    const to = insertAt !== null ? insertAt : indexOf(id);
    const next = reorderWithInsert(ordered, from, to);
    finalize(next);
    setDragId(null);
    setInsertAt(null);
  };

  const handleUpdate = (id: string, patch: Partial<RuleEntry>) => {
    if (!selectedNodeId) return;
    const prevRule = ordered.find((r) => r.id === id);
    if (prevRule && prevRule.action_on_execution === "route" && patch.action_on_execution && patch.action_on_execution !== "route") {
      const handleId = prevRule.type === "built-in" ? builtInRuleHandleId(prevRule.id) : customRuleHandleId(prevRule.id);
      removeRouteHandle(handleId);
    }
    const { focus: _, ...rest } = patch;
    const next = ordered.map((r) => {
      if (r.id !== id) return r;
      // Apply default routing logic for custom rules
      if (r.type === "custom") {
        const nextAction = rest.action_on_execution ?? r.action_on_execution;
        const isRouteAction = nextAction === "route";
        const defaultAvailable = customRoutingEnabled && !!defaultCustomRoute;
        const baseIsDefault = rest.isDefault;
        const nextIsDefault = baseIsDefault !== undefined ? !!baseIsDefault : defaultAvailable && isRouteAction;
        return {
          ...r,
          ...rest,
          isDefault: nextIsDefault,
          route: isRouteAction ? (nextIsDefault ? undefined : customRuleHandleId(r.id)) : rest.action_on_execution ? undefined : r.route,
        };
      }
      return { ...r, ...rest };
    });
    finalize(next);
  };

  const handleRemove = (id: string) => {
    if (!selectedNodeId) return;
    const prevRule = ordered.find((r) => r.id === id);
    if (prevRule && prevRule.action_on_execution === "route") {
      const handleId = prevRule.type === "built-in" ? builtInRuleHandleId(prevRule.id) : customRuleHandleId(prevRule.id);
      removeRouteHandle(handleId);
    }
    const filtered = ordered.filter((r) => r.id !== id);
    finalize(filtered);
  };

  const renderBuiltInRule = (r: RuleEntry, builtInTemplate: TemplateBuiltInRule) => {
    const enabled = r.enabled ?? false;
    const builtInModel: BuiltInRuleModel = {
      Id: builtInTemplate.Id,
      RuleName: builtInTemplate.RuleName,
      enabled,
      action_on_execution: r.action_on_execution,
      terminate_on_fail: !!r.terminate_on_fail,
      settings: r.settings,
      handleId: r.action_on_execution === "route" ? builtInRuleHandleId(r.id) : undefined,
      isDefault: r.isDefault ?? false,
      route: r.route,
      Outputs: builtInTemplate.Outputs,
      InputFields: builtInTemplate.InputFields,
    };
    return (
      <BuiltInRuleItem
        item={builtInModel}
        onToggle={(_id, nextEnabled) => handleUpdate(r.id, { enabled: nextEnabled })}
        onUpdate={(u) => {
          let nextSettings = r.settings;
          if (u.settings) {
            const existingArr = Array.isArray(r.settings) ? r.settings : [];
            const incomingArr = Array.isArray(u.settings) ? u.settings : [];
            const byKey = new Map<string, RuleSetting>();
            existingArr.forEach((s) => byKey.set(s.key, s));
            incomingArr.forEach((s) => byKey.set(s.key, s));
            nextSettings = Array.from(byKey.values());
          }
          // Default to workflow default routing when enabling route and workflow supports agentic default
          const nextAction = u.action_on_execution ?? r.action_on_execution;
          const isRouteAction = nextAction === "route";
          const defaultAvailable = agenticRoutingEnabled && !!defaultAgenticRoute;
          const baseIsDefault = u.isDefault ?? r.isDefault;
          const nextIsDefault = baseIsDefault !== undefined ? !!baseIsDefault : defaultAvailable && isRouteAction;
          const useDefaultRoute = defaultAvailable && nextIsDefault;
          handleUpdate(r.id, {
            action_on_execution: nextAction,
            terminate_on_fail: u.terminate_on_fail ?? r.terminate_on_fail,
            settings: nextSettings,
            // If agentic default routing is enabled and rule is set to default, set route to the destination node id
            route: nextAction === "route" ? (useDefaultRoute ? undefined : builtInRuleHandleId(r.id)) : u.action_on_execution ? undefined : r.route,
            isDefault: nextIsDefault,
          });
        }}
        selectedNodeId={selectedNodeId}
        hideHandle
      />
    );
  };

  if (!ordered.length) return null;
  return (
    <div className="mt-3 flex flex-col gap-2" data-unified-rules>
      <div className="flex items-center w-full">
        <div className="flex-1 min-w-0 rounded-md bg-sidebar border border-transparent p-1 pl-2 flex items-center gap-2">
          <GenOrModelIcon className="size-4 text-muted-foreground group-hover/system:text-foreground" />
          <p className="text-sm mt-[1px] text-muted-foreground truncate max-w-[180px] group-hover/system:text-foreground ">
            Agentic and custom rules
          </p>
          <WithTooltip tooltip="Agentic and custom rules are agent-specific or user-defined rules that can be customized per workflow.">
            <QuestionIcon className="size-4 text-muted-foreground" />
          </WithTooltip>
        </div>
      </div>
      {ordered.map((r, idx) => {
        const showTopSeparator = insertAt === idx && dragId !== null && dragId !== r.id;
        const builtInTemplate = agentBuiltIns.find((b) => b.Id === r.id);
        const content =
          r.type === "built-in" && builtInTemplate ? (
            renderBuiltInRule(r, builtInTemplate)
          ) : (
            <CustomRuleItem
              rule={r}
              onUpdateRule={(_id, patch) => handleUpdate(r.id, patch)}
              onRemoveRule={() => handleRemove(r.id)}
              selectedNodeId={selectedNodeId}
              disableDragHandle
              shouldAutoFocus={autoFocusRuleId === r.id}
            />
          );
        return (
          <div key={r.id} onDragOver={handleDragOver(r.id)} onDrop={handleDrop(r.id)} className="relative group/item -mx-2 px-2">
            <div
              onDragOver={handleDragOver(r.id)}
              onDrop={handleDrop(r.id)}
              className="absolute inset-x-0 -top-3 -bottom-3"
              style={{ pointerEvents: dragId ? "auto" : "none" }}
            />
            {showTopSeparator && (
              <div className="h-2 -mx-2">
                <div className="h-px w-full bg-foreground" />
              </div>
            )}
            <div className="relative" onDragEnd={endDrag}>
              <DragHandle hiddenUntilHover draggable onDragStart={handleDragStart(r.id)} className="absolute -left-4 top-1/2 -translate-y-1/2" />
              {content}
            </div>
          </div>
        );
      })}
      {insertAt === ordered.length && dragId && (
        <div className="h-2 -mx-2 -mb-0.5">
          <div className="h-px w-full bg-foreground" />
        </div>
      )}
    </div>
  );
}
