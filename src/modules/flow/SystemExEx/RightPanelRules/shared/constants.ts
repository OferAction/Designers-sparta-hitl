import { RuleAction } from "./RuleHandling";
import { SystemRuleAction } from "../system/SystemRulesItem";
import { BuiltInRuleOutputSpec } from "@/modules/flow/services/agent/agentTypes";

export const ACTION_META: Record<RuleAction, { label: string; description: string }> = {
  route: { label: "Route", description: "Create route to a node by dragging and attaching a path from the rule handle" },
  continue: { label: "Continue", description: "The workflow will continue executing on this sample." },
  terminate: { label: "Terminate", description: "When rule is satisfied all workflow branches will stop executing the sample" },
};

export const LANGUAGE_OPTIONS = [{ label: "Python", value: "python" }];

export const defaultOutputs: BuiltInRuleOutputSpec[] = [
  { Key: "Satisfied", Type: "boolean", Description: "True when the rule logic is satisfied" },
  { Key: "Message", Type: "string", Description: "Details generated in the rule logic" },
  { Key: "AdditionalOutputs", Type: "object", Description: "Additional outputs generated in the rule logic" },
];

export const SYSTEM_ACTION_META: Record<SystemRuleAction, { label: string; description: string }> = {
  terminate: {
    label: "Terminate",
    description: "When rule is satisfied all workflow branches will stop executing the sample",
  },
  route: {
    label: "Route",
    description: "Create route to a node by dragging and attaching a path from the rule handle",
  },
  retry: {
    label: "Retry",
    description: "When rule is satisfied the workflow will retry processing the sample from the start",
  },
  continue: {
    label: "Continue",
    description: "The workflow will continue executing on this sample.",
  },
};
