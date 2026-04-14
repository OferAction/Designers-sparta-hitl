import type { TemplateBuiltInRule, BuiltInRuleOutputSpec, BuiltInRuleInputField } from "@/modules/flow/services/agent/agentTypes";
import type { RuleSetting, BuiltInRuleAction } from "@/modules/flow/types/BaseNodeTypes";

export interface BuiltInRuleModel extends Pick<TemplateBuiltInRule, "Id" | "RuleName" | "Outputs" | "InputFields"> {
  enabled: boolean;
  action_on_execution: BuiltInRuleAction;
  terminate_on_fail: boolean;
  settings?: RuleSetting[];
  handleId?: string;
  isDefault?: boolean;
  route?: string;
  Outputs: BuiltInRuleOutputSpec[];
  InputFields: BuiltInRuleInputField[];
}
