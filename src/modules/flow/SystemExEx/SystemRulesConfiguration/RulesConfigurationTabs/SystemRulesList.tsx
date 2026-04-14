import { PlaceholderIcon } from "@phosphor-icons/react";

import { useSystemRulesConfiguration } from "@/modules/flow/hooks/useSystemRulesConfiguration";

import { InputLabel } from "@/components/common/InputLabel";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SYSTEM_ACTION_META } from "@/modules/flow/SystemExEx/RightPanelRules/shared";
import { SystemRuleAction } from "@/modules/flow/SystemExEx/RightPanelRules/system/SystemRulesItem";
import { cn } from "@/utils";

export const SystemRulesList: React.FC = () => {
  const { file, handleSelect } = useSystemRulesConfiguration();

  if (!file?.systemRules) {
    return null;
  }

  return (
    <div className="space-y-2 max-h-[35vh] overflow-auto thin-scrollbar px-5 m-1 border-b border-muted pb-2">
      {file.systemRules.map((rule) => (
        <div key={rule.name} className="flex items-center justify-between rounded-md border border-muted/75 bg-background/50 px-2.5 py-1">
          <div className="text-sm text-sidebar-foreground/70">{rule.name}</div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <InputLabel
                variant="flat"
                size="md"
                className={cn("cursor-pointer select-none pr-1 pl-2")}
                icon={rule.action === "terminate" ? <PlaceholderIcon size={14} weight="fill" className="text-muted-foreground" /> : undefined}
                value={SYSTEM_ACTION_META[rule.action].label}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" sideOffset={4} className="min-w-[140px]">
              {Object.entries(SYSTEM_ACTION_META).map(([key, meta]) => {
                const active = rule.action === key;
                return (
                  <DropdownMenuItem
                    key={key}
                    onClick={() => handleSelect(rule.name, key as SystemRuleAction)}
                    className={cn("flex items-center gap-2 text-xs", active ? "bg-primary/10 text-foreground" : "")}
                  >
                    {key === "terminate" && <PlaceholderIcon size={14} weight="fill" className="opacity-80" />}
                    {meta.label}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  );
};
