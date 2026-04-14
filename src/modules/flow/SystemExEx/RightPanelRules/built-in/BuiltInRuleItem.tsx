import { useState } from "react";

import { SlidersHorizontalIcon, PlaceholderIcon } from "@phosphor-icons/react";
import { useParams } from "react-router-dom";

import BuiltInRuleDialog from "./BuiltInRuleDialog";
import { RuleRouteDisplay, RuleCopyPasteMenu } from "../shared";
import { InputLabel } from "@/components/common/InputLabel";
import WithTooltip from "@/components/common/WithTooltip";
import { Switch } from "@/components/ui/switch";
import DragHandle from "@/modules/flow/components/ContextualPanel/shared/DragHandle";
import type { RuleEntry } from "@/modules/flow/types/BaseNodeTypes";
import { useGetFileRoutingConfig } from "@/services/fileService/fileService";
import { cn } from "@/utils";

import type { BuiltInRuleModel } from "./builtInRulesTypes";

export default function BuiltInRuleItem({
  item,
  onToggle,
  onUpdate,
  selectedNodeId,
  dragHandleProps,
  hideHandle,
}: {
  item: BuiltInRuleModel;
  onToggle: (id: string, enabled: boolean) => void;
  onUpdate: (update: Partial<BuiltInRuleModel>) => void;
  selectedNodeId: string | undefined;
  dragHandleProps?: React.HTMLAttributes<HTMLSpanElement>;
  hideHandle?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const { fileId = "" } = useParams();
  const { data: routingConfig } = useGetFileRoutingConfig(fileId);
  const defaultAgenticRoute = routingConfig?.defaultAgenticRoute || "";

  // Convert built-in model to RuleEntry for clipboard operations
  const ruleEntry: RuleEntry = {
    id: item.Id,
    name: item.RuleName,
    type: "built-in",
    action_on_execution: item.action_on_execution,
    terminate_on_fail: item.terminate_on_fail,
    enabled: item.enabled,
    settings: item.settings,
    order: 0,
  };

  return (
    <RuleCopyPasteMenu rule={ruleEntry} onUpdateRule={(_id, patch) => onUpdate(patch)} onConfigure={() => setOpen(true)}>
      <div className="group/rule flex items-center relative">
        {!hideHandle && <DragHandle className="absolute -left-4 top-1/2 -translate-y-1/2" hiddenUntilHover {...dragHandleProps} />}
        <div className="flex items-center flex-1 gap-2 p-1 pl-2 relative border border-transparent hover:border hover:border-input hover:bg-accent rounded-md">
          <Switch
            className="data-[state=unchecked]:bg-input"
            thumbClassName="bg-background"
            size="sm"
            checked={item.enabled}
            onCheckedChange={(v) => onToggle(item.Id, v)}
          />
          <p className="text-sm text-muted-foreground truncate max-w-[160px] transition-colors group-hover/rule:text-primary">{item.RuleName}</p>
          <div className="ml-auto flex items-center gap-1">
            {(item.action_on_execution === "terminate" || item.action_on_execution === "continue") && (
              <>
                {
                  <WithTooltip tooltip="Terminate execution when satisfied">
                    <InputLabel
                      variant="flat"
                      size="md"
                      onClick={() => setOpen(true)}
                      className={cn(
                        "cursor-pointer select-none inline-block py-0.5 px-1 h-6 min-w-fit justify-center border-none hover:bg-accent group-hover/rule:inline-flex"
                      )}
                      icon={
                        item.action_on_execution === "terminate" ? (
                          <PlaceholderIcon size={16} weight="fill" className="text-muted-foreground group-hover/rule:text-foreground" />
                        ) : null
                      }
                    >
                      <span className="hidden group-hover/rule:block text-foreground text-sm">
                        {item.action_on_execution === "terminate" ? "Terminate" : "Continue"}
                      </span>
                    </InputLabel>
                  </WithTooltip>
                }
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="hidden group-hover/rule:inline-flex h-6 w-6 items-center justify-center rounded-sm text-foreground hover:bg-accent/40 transition"
                >
                  <SlidersHorizontalIcon size={14} />
                </button>
              </>
            )}
            {item.action_on_execution !== "terminate" && item.action_on_execution !== "continue" && (
              <WithTooltip tooltip="Configure built-in rule">
                <button
                  type="button"
                  onClick={() => setOpen(true)}
                  className="h-6 w-6 inline-flex items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-accent/40 transition opacity-0 group-hover/rule:opacity-100"
                >
                  <SlidersHorizontalIcon size={14} />
                </button>
              </WithTooltip>
            )}
          </div>
        </div>
        {item.action_on_execution === "route" && (!item.isDefault || (item.isDefault && defaultAgenticRoute)) && (
          <RuleRouteDisplay
            action={item.action_on_execution}
            handleId={item.handleId}
            sourceNodeId={selectedNodeId}
            isDefault={!!item.isDefault}
            targetNodeId={item.isDefault ? defaultAgenticRoute : undefined}
            onClick={() => setOpen(true)}
          />
        )}
        <BuiltInRuleDialog open={open} onOpenChange={setOpen} rule={item} onChange={onUpdate} selectedNodeId={selectedNodeId} />
      </div>
    </RuleCopyPasteMenu>
  );
}
