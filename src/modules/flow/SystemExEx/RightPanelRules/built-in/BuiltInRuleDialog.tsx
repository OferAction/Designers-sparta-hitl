import { XIcon } from "@phosphor-icons/react";
import { useParams } from "react-router-dom";

import { useAncestorValueOptions } from "@/modules/flow/hooks/useAncestorValueOptions";

import { RuleHandling, RuleOutputs, handleDefaultRoutingChange, BUILT_IN_RULE_HANDLE_PREFIX } from "../shared";
import ConnectionDots from "@/components/common/ConnectionDots";
import { AutocompleteTag } from "@/components/common/input-tags";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { InputTag } from "@/components/ui/input-tag";
import { VALUE_ICONS_MAP } from "@/constants";
import { PanelDialogWrapper } from "@/modules/flow/components/dialog/PanelDialogWrapper";
import { BuiltInRuleOutputSpec } from "@/modules/flow/services/agent/agentTypes";
import { useGetFileRoutingConfig } from "@/services/fileService/fileService";
import { cn } from "@/utils";

import type { BuiltInRuleModel } from "./builtInRulesTypes";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rule: BuiltInRuleModel;
  onChange: (update: Partial<BuiltInRuleModel>) => void;
  selectedNodeId?: string;
};

export default function BuiltInRuleDialog({ open, onOpenChange, rule, onChange, selectedNodeId }: Props) {
  const ancestorGroupedOptions = useAncestorValueOptions(selectedNodeId);
  const inputFields = rule.InputFields || [];

  const { fileId = "" } = useParams();
  const { data: routingConfig } = useGetFileRoutingConfig(fileId);

  const defaultAgenticRoute = routingConfig?.defaultAgenticRoute || "";
  const agenticRoutingEnabled = !!routingConfig?.agenticRoutingEnabled;

  const getSetting = (key: string) => (rule.settings || []).find((s) => s.key === key);
  const upsertSetting = (key: string, type: string, value: { label: string; value: string } | undefined, isReference: boolean) => {
    const next = [...(rule.settings || [])];
    const idx = next.findIndex((s) => s.key === key);
    const payload = { key, type, value, isReference };
    if (idx >= 0) next[idx] = payload;
    else next.push(payload);
    onChange({ settings: next });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <PanelDialogWrapper
        position="none"
        className={cn("w-[420px] max-h-[70vh] flex flex-col border-border bg-ocr-modal-bg/30 translate-x-0 translate-y-0 origin-center p-0")}
      >
        <DialogTitle className="sr-only">Built-in Rule: {rule.RuleName}</DialogTitle>
        <div className="flex-shrink-0 flex items-center justify-between px-4 pt-4 pb-3 border-b border-border">
          <h3 className="text-sm text-muted-foreground font-medium truncate pr-4">{rule.RuleName}</h3>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
            aria-label="Close dialog"
          >
            <XIcon size={14} weight="bold" />
          </button>
        </div>
        <div className="px-4 py-3 flex flex-col gap-4 overflow-y-auto">
          <div className="flex flex-col gap-3 pb-3 border-b border-border/50">
            <span className="text-xs font-medium text-sidebar-foreground">Settings</span>
            {inputFields.length === 0 ? (
              <div className="text-xs text-muted-foreground">No settings required.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {inputFields.map((f) => {
                  const typeLabelRaw = f.FieldType;
                  const typeLabel = typeLabelRaw ? typeLabelRaw.charAt(0).toUpperCase() + typeLabelRaw.slice(1) : "";
                  const TypeIcon = VALUE_ICONS_MAP(typeLabel);
                  const ancestorOptions = ancestorGroupedOptions;
                  const setting = getSetting(f.FieldName);
                  const currentValue = setting?.value;

                  return (
                    <div key={f.FieldName} className="flex items-center ml-3">
                      <span className="text-sm text-muted-foreground truncate" title={f.FieldName}>
                        {f.FieldName}
                      </span>
                      <ConnectionDots className="flex-1 ml-1 h-px text-muted-foreground max-w-3" />
                      <InputTag.Root variant="emphasized" className="max-w-[210px]">
                        <div className="flex items-center w-full">
                          <TypeIcon className="size-4 text-muted-foreground mx-1 shrink-0" />
                          <AutocompleteTag
                            placeholder="Type or select a value"
                            options={ancestorOptions}
                            selectedOption={currentValue}
                            onOptionChange={(option: { label: string; value: string; isReference?: boolean } | null) => {
                              if (!option) {
                                upsertSetting(f.FieldName, f.FieldType, undefined, false);
                                return;
                              }
                              const isRef = !!option.isReference;
                              upsertSetting(f.FieldName, f.FieldType, { label: option.label, value: option.value }, isRef);
                            }}
                          />
                        </div>
                      </InputTag.Root>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          {rule.Outputs && rule.Outputs.length > 0 && (
            <div className="flex flex-col gap-3 py-3 border-b border-border/50">
              <RuleOutputs outputs={rule.Outputs as BuiltInRuleOutputSpec[]} label="Outputs" />
            </div>
          )}
          <RuleHandling
            action={rule.action_on_execution}
            onActionChange={(a) => onChange({ action_on_execution: a })}
            terminateOnFail={rule.terminate_on_fail}
            onTerminateOnFailChange={(v) => onChange({ terminate_on_fail: v })}
            defaultRouteEnabled={agenticRoutingEnabled}
            defaultRouteNodeId={defaultAgenticRoute}
            isDefault={agenticRoutingEnabled && !!rule.isDefault}
            onDefaultChange={(v) => {
              handleDefaultRoutingChange(v, {
                selectedNodeId,
                ruleHandleId: rule.handleId || "",
                handlePrefix: BUILT_IN_RULE_HANDLE_PREFIX,
                defaultRoute: defaultAgenticRoute,
                currentAction: rule.action_on_execution,
                onChange,
              });
            }}
            ruleHandleId={rule.handleId}
            selectedNodeId={selectedNodeId}
          />
        </div>
      </PanelDialogWrapper>
    </Dialog>
  );
}
