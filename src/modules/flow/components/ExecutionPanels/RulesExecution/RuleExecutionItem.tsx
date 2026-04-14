import { useState } from "react";

import { CheckIcon, XIcon } from "@phosphor-icons/react";

import { toast } from "@/hooks/use-toast";

import { ruleItemVariants, ruleNameVariants, statusColorVariants } from "./ruleExecutionVariants";
import { Terminal, TerminalContent, TerminalEditor } from "@/components/common/CodeTerminal";
import { cn } from "@/lib/utils";
import { RuleStatus } from "@/modules/flow/components/ExecutionPanels/types";

export type RuleExecutionStatus = "idle" | "running" | "notExecuted" | RuleStatus;

export interface RuleExecutionData {
  ruleId: string;
  ruleName: string;
  ruleType: "custom" | "built-in" | "system";
  status: RuleExecutionStatus;
  message?: string;
  actionOnExecution?: "route" | "terminate" | "continue" | null;
  additional?: Record<string, any>;
  icon?: React.ComponentType<{ size?: number; weight?: string; className?: string }>;
}

interface RuleExecutionItemProps {
  rule: RuleExecutionData;
  isExpanded?: boolean;
  onToggle?: () => void;
}

export function RuleExecutionItem({ rule }: RuleExecutionItemProps) {
  const RuleIcon = rule.icon;
  const [isExpanded, setIsExpanded] = useState(true);

  const hasadditional = rule.additional && Object.keys(rule.additional).length > 0;
  const additionalJson = hasadditional ? JSON.stringify(rule.additional, null, 2) : "";

  const handleToggle = () => {
    if (hasadditional) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div>
      <div
        className={cn(ruleItemVariants({ ruleType: rule.ruleType, status: rule.status }), hasadditional && "cursor-pointer")}
        onClick={handleToggle}
      >
        <div className="flex items-center gap-2 w-full">
          {RuleIcon && <RuleIcon className={cn("size-4 flex-shrink-0", statusColorVariants({ status: rule.status }))} />}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={ruleNameVariants({ status: rule.status })}>{rule.ruleName}</span>
              {rule.status === RuleStatus.Satisfied && <CheckIcon className="size-4 text-success flex-shrink-0" weight="bold" />}
              {rule.status === "notExecuted" && <XIcon className="ml-auto size-4 text-muted-foreground/50 flex-shrink-0" weight="bold" />}
              {rule.actionOnExecution && (rule.status === RuleStatus.NotSatisfied || rule.status === RuleStatus.Failed) && (
                <span className="ml-auto text-xs px-1.5 py-0.5 rounded text-muted-foreground capitalize">{rule.actionOnExecution}</span>
              )}
            </div>
          </div>
        </div>
        {rule.message && (
          <div
            className="text-xs text-foreground text-wrap break-all hover:underline"
            onClick={async () => {
              if (!rule.message) return;
              await navigator.clipboard.writeText(rule.message);
              toast({ title: "Message copied to clipboard" });
            }}
          >
            {rule.message}
          </div>
        )}
        {hasadditional && isExpanded && (
          <div className="bg-background">
            <Terminal className="mt-1 bg-background border-none">
              <TerminalContent>
                <TerminalEditor className="h-6 w-full border-none bg-transparent text-foreground" value={additionalJson} readOnly />
              </TerminalContent>
            </Terminal>
          </div>
        )}
      </div>
    </div>
  );
}
