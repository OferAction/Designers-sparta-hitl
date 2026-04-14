import { useMemo } from "react";

import { FunnelIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";

import { useIterationPathForNode } from "@/modules/flow/hooks/useIteratorPath";

import { RuleExecutionData, RuleExecutionItem } from "./RuleExecutionItem";
import { ExecutionDataPanel } from "../ExecutionDataPanel";
import { CustomRuleFunnelIcon } from "@/lib/icons";
import { RuleStatus } from "@/modules/flow/components/ExecutionPanels/types";
import { useGetNodeResult } from "@/modules/flow/services/jobService/jobService";
import { RuleEntry } from "@/modules/flow/types";
import { FlowStoreState, useFlowStore } from "@/store";

interface RulesPanelProps {
  nodeId?: string;
  nodeLabel?: string;
  className?: string;
}

const RULE_TYPE_ICONS = {
  custom: CustomRuleFunnelIcon,
  "built-in": FunnelIcon,
};

// Map backend status string keys to RuleStatus enum values
const normalizeRuleStatus = (status: string | number | undefined): RuleExecutionData["status"] => {
  if (status === undefined || status === null) return "idle";

  // If it's already a number (enum value), return status as RuleStatus
  if (typeof status === "number") return status as RuleStatus;

  // Map string keys to enum values
  const statusMap: Record<string, RuleStatus> = {
    Satisfied: RuleStatus.Satisfied,
    NotSatisfied: RuleStatus.NotSatisfied,
    Failed: RuleStatus.Failed,
  };

  return statusMap[status] ?? "idle";
};

const selector = (state: FlowStoreState) => ({
  jobId: state.jobId,
  nodes: state.nodes,
});

export function RulesPanel({ nodeId, className }: RulesPanelProps) {
  const { jobId, nodes } = useFlowStore(useShallow(selector));

  const iteration = useIterationPathForNode(nodeId || undefined);
  const { data: nodeResult } = useGetNodeResult(jobId, nodeId || "", iteration);

  const currentNode = useMemo(() => {
    return nodes.find((node) => node.id === nodeId);
  }, [nodes, nodeId]);

  const rules: RuleExecutionData[] = useMemo(() => {
    if (!currentNode?.data) return [];

    const nodeData = currentNode.data;
    const nonSystemRules = nodeData.rules?.non_system_rules || [];
    const apiRules = nodeResult?.rules || [];

    const ruleStatusMap = new Map(apiRules.map((r) => [r.id, r]));

    return nonSystemRules.map((rule: RuleEntry) => {
      const ruleId = rule.id;
      const apiRuleData = ruleStatusMap.get(ruleId);
      const ruleType = rule.type || (rule.id?.startsWith("built_in_") ? "built-in" : "custom");
      const RuleIcon = RULE_TYPE_ICONS[ruleType as keyof typeof RULE_TYPE_ICONS];

      // If there's no API data and we have nodeResult (meaning execution happened), mark as not executed
      const hasExecutionData = nodeResult && apiRules.length > 0;
      const wasExecuted = apiRuleData !== undefined;

      let status: RuleExecutionData["status"];
      if (hasExecutionData && !wasExecuted) {
        status = "notExecuted";
      } else if (apiRuleData) {
        status = normalizeRuleStatus(apiRuleData.status);
      } else {
        status = "idle";
      }

      return {
        ruleId,
        ruleName: rule.name || "Unnamed Rule",
        ruleType,
        status,
        message: apiRuleData?.message,
        actionOnExecution: apiRuleData?.action || rule.action_on_execution || null,
        additional: apiRuleData?.additional,
        icon: RuleIcon,
      } as RuleExecutionData;
    });
  }, [currentNode, nodeResult]);

  // System rules based on errorMessages
  const systemRule: RuleExecutionData | null = useMemo(() => {
    if (!nodeResult) return null;

    const hasErrors = nodeResult.errorMessages && nodeResult.errorMessages.trim().length > 0;

    if (!hasErrors) {
      return null;
    }

    return {
      ruleId: "system-rules",
      ruleName: "All system rules",
      ruleType: "system",
      status: hasErrors ? RuleStatus.Failed : RuleStatus.Satisfied,
      message: nodeResult.errorMessages,
    } as RuleExecutionData;
  }, [nodeResult]);

  return (
    <ExecutionDataPanel title="Rules" className={className} showFilesDropdown={false} emptyMessage="No rules configured for this node">
      {systemRule || rules.length > 0 ? (
        <div className="overflow-y-auto h-full">
          {systemRule && <RuleExecutionItem key={systemRule.ruleId} rule={systemRule} />}
          {rules.map((rule) => (
            <RuleExecutionItem key={rule.ruleId} rule={rule} />
          ))}
        </div>
      ) : null}
    </ExecutionDataPanel>
  );
}
