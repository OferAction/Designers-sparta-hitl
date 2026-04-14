import { memo, useEffect, useRef, useState } from "react";

import { SlidersHorizontalIcon, DotsThreeVerticalIcon, GearSixIcon, TrashIcon, CopyIcon, ClipboardIcon } from "@phosphor-icons/react";
import { useParams } from "react-router-dom";

import { useCopyPasteRule } from "@/modules/flow/hooks/useCopyPasteRule";

import CustomRuleDialog from "./CustomRuleDialog";
import { RuleRouteDisplay, RuleCopyPasteMenu } from "../shared";
import { CustomRuleFunnelIcon } from "@/lib/icons";
import { AutoSizeInput } from "@/components/common";
import WithTooltip from "@/components/common/WithTooltip";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import DragHandle from "@/modules/flow/components/ContextualPanel/shared/DragHandle";
import type { RuleEntry } from "@/modules/flow/types/BaseNodeTypes";
import { useGetFileRoutingConfig } from "@/services/fileService/fileService";

interface CustomRuleItemProps {
  rule: RuleEntry;
  onUpdateRule: (id: string, update: Partial<RuleEntry>) => void;
  onRemoveRule: (id: string) => void;
  selectedNodeId?: string;
  disableDragHandle?: boolean;
  shouldAutoFocus?: boolean;
}

const CustomRuleItem = memo(function CustomRuleItem({
  rule,
  onUpdateRule,
  onRemoveRule,
  selectedNodeId,
  disableDragHandle,
  shouldAutoFocus,
}: CustomRuleItemProps) {
  const [open, setOpen] = useState(false);
  const openDialog = () => setOpen(true);
  const closeDialog = () => setOpen(false);
  const { copyRuleConfig, pasteRuleConfig, hasClipboardData } = useCopyPasteRule();

  const { fileId = "" } = useParams();
  const { data: routingConfig } = useGetFileRoutingConfig(fileId);
  const defaultCustomRoute = routingConfig?.defaultCustomRoute || "";

  const inputRef = useRef<HTMLInputElement>(null);
  const MIN_WIDTH = 100;
  const MAX_WIDTH = 180;

  const handleCopy = async () => {
    await copyRuleConfig(rule);
  };

  const handlePaste = async () => {
    await pasteRuleConfig(rule, onUpdateRule);
  };

  // Focus management
  const hasFocusedRef = useRef(false);
  useEffect(() => {
    if (shouldAutoFocus && !hasFocusedRef.current) {
      inputRef.current?.focus();
      hasFocusedRef.current = true;
    }
  }, [shouldAutoFocus]);

  return (
    <RuleCopyPasteMenu rule={rule} onUpdateRule={onUpdateRule} onConfigure={openDialog} onRemove={() => onRemoveRule(rule.id)}>
      <div className="group/rule flex items-center relative">
        {!disableDragHandle && <DragHandle className="absolute -left-4 top-1/2 -translate-y-1/2" hiddenUntilHover />}
        <div className="flex items-center flex-1 gap-2 p-1 pl-2 relative border border-transparent hover:border hover:border-input hover:bg-accent rounded-md">
          <span className="inline-flex items-center justify-center rounded-sm text-muted-foreground group-hover/rule:text-foreground">
            <CustomRuleFunnelIcon className="size-4" />
          </span>
          <AutoSizeInput minWidth={MIN_WIDTH} maxWidth={MAX_WIDTH}>
            <Input
              value={rule.name || ""}
              onChange={(e) => !open && onUpdateRule(rule.id, { name: e.target.value })}
              className="truncate h-6 border border-transparent hover:border-border text-sm text-muted-foreground hover:text-foreground disabled:opacity-70 placeholder:opacity-60"
              disabled={open}
              ref={inputRef}
              placeholder="Rule Name"
            />
          </AutoSizeInput>
          <div className="ml-auto flex items-center gap-1">
            <WithTooltip tooltip="Configure rule">
              <Button size="icon" variant="ghost" className="size-6 opacity-0 group-hover/rule:opacity-100 hover:bg-accent/40" onClick={openDialog}>
                <SlidersHorizontalIcon size={14} />
              </Button>
            </WithTooltip>
            <DropdownMenu>
              <WithTooltip tooltip="More">
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost" className="size-6 opacity-0 group-hover/rule:opacity-100 hover:bg-accent/40">
                    <DotsThreeVerticalIcon size={16} weight="bold" />
                  </Button>
                </DropdownMenuTrigger>
              </WithTooltip>
              <DropdownMenuContent align="end" className="min-w-[160px]">
                <DropdownMenuItem onClick={openDialog} className="text-xs gap-2">
                  <GearSixIcon size={14} /> Configure
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopy} className="text-xs gap-2">
                  <CopyIcon size={14} /> Copy configuration
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handlePaste} disabled={!hasClipboardData} className="text-xs gap-2">
                  <ClipboardIcon size={14} /> Paste configuration
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onRemoveRule(rule.id)} className="text-xs gap-2 text-destructive focus:text-destructive">
                  <TrashIcon size={14} /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {rule.action_on_execution === "route" && (!rule.isDefault || (rule.isDefault && defaultCustomRoute)) && (
          <RuleRouteDisplay
            action={rule.action_on_execution}
            handleId={rule.route}
            sourceNodeId={selectedNodeId}
            isDefault={!!rule.isDefault}
            targetNodeId={rule.isDefault ? defaultCustomRoute : undefined}
            onClick={openDialog}
          />
        )}
        {open && (
          <CustomRuleDialog
            open={open}
            onOpenChange={(v) => (!v ? closeDialog() : undefined)}
            rule={rule}
            onChange={(u) => onUpdateRule(rule.id, u)}
          />
        )}
      </div>
    </RuleCopyPasteMenu>
  );
});

export default CustomRuleItem;
