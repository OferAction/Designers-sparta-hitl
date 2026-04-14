import { CopyIcon, ClipboardIcon, GearSixIcon, TrashIcon } from "@phosphor-icons/react";

import { useCopyPasteRule } from "@/modules/flow/hooks/useCopyPasteRule";

import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuSeparator } from "@/components/ui/context-menu";
import type { RuleEntry } from "@/modules/flow/types/BaseNodeTypes";

interface RuleCopyPasteMenuProps {
  children: React.ReactNode;
  rule: RuleEntry;
  onUpdateRule: (id: string, update: Partial<RuleEntry>) => void;
  onConfigure?: () => void;
  onRemove?: () => void;
  validateRoute?: (route: string | undefined, isDefault: boolean | undefined) => boolean;
}

export function RuleCopyPasteMenu({ children, rule, onUpdateRule, onConfigure, onRemove, validateRoute }: RuleCopyPasteMenuProps) {
  const { copyRuleConfig, pasteRuleConfig, hasClipboardData } = useCopyPasteRule();

  const handleCopy = async () => {
    await copyRuleConfig(rule);
  };

  const handlePaste = async () => {
    await pasteRuleConfig(rule, onUpdateRule, validateRoute);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="min-w-[160px]">
        {onConfigure && (
          <>
            <ContextMenuItem onClick={onConfigure} className="text-xs gap-2">
              <GearSixIcon size={14} /> Configure
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        <ContextMenuItem onClick={handleCopy} className="text-xs gap-2">
          <CopyIcon size={14} /> Copy configuration
          <span className="ml-auto text-[10px] text-muted-foreground">⌘C</span>
        </ContextMenuItem>
        <ContextMenuItem onClick={handlePaste} disabled={!hasClipboardData} className="text-xs gap-2">
          <ClipboardIcon size={14} /> Paste configuration
          <span className="ml-auto text-[10px] text-muted-foreground">⌘V</span>
        </ContextMenuItem>
        {onRemove && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={onRemove} className="text-xs gap-2 text-destructive focus:text-destructive">
              <TrashIcon size={14} /> Delete
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}
