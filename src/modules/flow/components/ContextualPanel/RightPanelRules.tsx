import { useCallback, useState } from "react";

import { PlusIcon, SlidersHorizontalIcon } from "@phosphor-icons/react";

import { useSelectedNode } from "../../hooks";
import WithTooltip from "@/components/common/WithTooltip";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle, SectionTitleButton } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { useAgentsWithTemplates } from "@/modules/flow/services/agent/agentService";
import { UnifiedRulesList } from "@/modules/flow/SystemExEx/RightPanelRules/shared";
import { openSystemRulesConfiguration } from "@/modules/flow/SystemExEx/RightPanelRules/shared/utils";
import { SystemRulesItem } from "@/modules/flow/SystemExEx/RightPanelRules/system";
import type { RuleEntry, NodeData } from "@/modules/flow/types/BaseNodeTypes";
import { useFlowStore } from "@/store";
import { genId } from "@/utils";

export default function RightPanelRules() {
  const [autoFocusRuleId, setAutoFocusRuleId] = useState<string | null>(null);
  const onChange = useFlowStore((s) => s.onChange);
  const selectedNode = useSelectedNode();
  const { data: agents } = useAgentsWithTemplates(false);

  const handleAddRule = useCallback(() => {
    if (!selectedNode) return;
    const data: NodeData = selectedNode.data || {};
    const existingAll: RuleEntry[] = Array.isArray(data.rules?.non_system_rules) ? data.rules.non_system_rules : [];
    const maxOrder = existingAll.length ? Math.max(...existingAll.map((r) => r.order ?? 0)) : -1;
    const newRule: RuleEntry = {
      id: genId().replace(/-/g, ""),
      name: "New Custom Rule",
      type: "custom",
      action_on_execution: "terminate",
      terminate_on_fail: false,
      logic: {
        code: `def main(data: dict) -> dict:
    """
    All input variables are available in the \`data\` dict.
    """

    return {
        "Satisfied": True,
        "Message": "",
        "AdditionalOutputs": data,
    }
`,
        dependencies: [],
        language: "python",
        input_vars: [],
      },
      custom_rule_type: "code-agent",
      route: undefined,
      isDefault: false,
      order: maxOrder + 1,
    };
    const merged = [...existingAll, newRule];
    onChange(selectedNode.id, "rules", { ...(data.rules || {}), non_system_rules: merged });
    setAutoFocusRuleId(newRule.id);
  }, [selectedNode, onChange]);

  const nodeTypeMatchKey = selectedNode?.data?.name;

  const matchedAgent = agents?.find((a) => (a.agent?.name || "").toLowerCase() === nodeTypeMatchKey?.toLowerCase());
  const agentBuiltIns = matchedAgent?.agentTemplate?.builtInRules || [];

  const openAdvancedParams = useCallback(() => {
    openSystemRulesConfiguration();
  }, []);

  return (
    <SectionContainer>
      <SectionTitle title="Reliability Rules" tooltip={`Apply rules to determine routing and\nExplainable No Outcomes (ENO) cases.`}>
        <WithTooltip tooltip="Add rule">
          <SectionTitleButton onClick={openAdvancedParams}>
            <SlidersHorizontalIcon className="size-4" />
          </SectionTitleButton>
        </WithTooltip>
        <WithTooltip tooltip="Add rule">
          <SectionTitleButton onClick={handleAddRule}>
            <PlusIcon className="text-foreground" />
          </SectionTitleButton>
        </WithTooltip>
      </SectionTitle>
      <SystemRulesItem />
      <UnifiedRulesList agentBuiltIns={agentBuiltIns} autoFocusRuleId={autoFocusRuleId} />
    </SectionContainer>
  );
}
