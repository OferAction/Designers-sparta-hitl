import { ChangeEvent, useCallback, useMemo, useState, useEffect } from "react";

import { PlusIcon, XIcon, TrashIcon as Trash2, QuestionIcon as HelpCircle } from "@phosphor-icons/react";
import { useParams } from "react-router-dom";

import { useAncestorValueOptions } from "@/modules/flow/hooks/useAncestorValueOptions";
import { useSelectedNode } from "@/modules/flow/hooks/useSelectedNode";

import {
  LANGUAGE_OPTIONS,
  defaultOutputs,
  RuleHandling,
  RuleOutputs,
  customRuleHandleId,
  RuleAction,
  handleDefaultRoutingChange,
  CUSTOM_RULE_HANDLE_PREFIX,
} from "../shared";
import {
  Terminal,
  TerminalHeader,
  TerminalTitle,
  TerminalControls,
  TerminalContent,
  TerminalEditor,
  CopyButton,
  ExpandButton,
  TerminalCopyBadge,
} from "@/components/common/CodeTerminal";
import { ChangeLanguage } from "@/components/common/CodeTerminal/controls/ChangeLanguage";
import ConnectionDots from "@/components/common/ConnectionDots";
import { AutocompleteTag, IconSelectTag } from "@/components/common/input-tags";
import WithTooltip from "@/components/common/WithTooltip";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTitle } from "@/components/ui/dialog";
import { InputTag } from "@/components/ui/input-tag";
import { Textarea } from "@/components/ui/textarea";
import { PanelDialogWrapper } from "@/modules/flow/components/dialog/PanelDialogWrapper";
import type { RuleEntry, RuleVars as RuleArg } from "@/modules/flow/types/BaseNodeTypes";
import { useGetFileRoutingConfig } from "@/services/fileService/fileService";
import { cn } from "@/utils";

interface CustomRuleDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  rule: RuleEntry;
  onChange: (update: Partial<RuleEntry>) => void;
}

export default function CustomRuleDialog({ open, onOpenChange, rule, onChange }: CustomRuleDialogProps) {
  const [draftName, setDraftName] = useState(rule.name || "");
  const selectedNode = useSelectedNode();
  const selectedNodeId = selectedNode?.id;
  const selectedNodeData = selectedNode?.data;

  const { fileId = "" } = useParams();
  const { data: routingConfig } = useGetFileRoutingConfig(fileId);

  const defaultCustomRoute = routingConfig?.defaultCustomRoute || "";
  const customRoutingEnabled = !!routingConfig?.customRoutingEnabled;

  useEffect(() => {
    const external = rule.name || "";
    if (external !== draftName) setDraftName(external);
  }, [rule.name, draftName]);

  const currentArgs: RuleArg[] = useMemo(
    () => (rule.logic?.input_vars && Array.isArray(rule.logic.input_vars) ? rule.logic.input_vars : []),
    [rule.logic]
  );
  const baseLogic = useCallback(
    (override?: Partial<RuleEntry["logic"]>) => ({
      code: rule.logic?.code || "",
      language: rule.logic?.language || "python",
      dependencies: rule.logic?.dependencies || [],
      input_vars: currentArgs,
      ...override,
    }),
    [rule.logic, currentArgs]
  );

  const addArg = () => {
    const next: RuleArg = { key: `var${currentArgs.length + 1}`, type: "string" };
    onChange({ logic: baseLogic({ input_vars: [...currentArgs, next] }) });
  };
  const updateArg = (idx: number, patch: Partial<RuleArg>) => {
    const next = currentArgs.map((a, i) => (i === idx ? { ...a, ...patch } : a));
    onChange({ logic: baseLogic({ input_vars: next }) });
  };
  const removeArg = (idx: number) => {
    const next = currentArgs.filter((_, i) => i !== idx);
    onChange({ logic: baseLogic({ input_vars: next }) });
  };

  const language = rule.logic?.language || "python";
  const ancestorOptions = useAncestorValueOptions(selectedNodeId);
  const currentNodeOption = useMemo(() => {
    if (!selectedNodeId) return null;
    const outputsArr = Array.isArray(selectedNodeData?.outputs) ? selectedNodeData.outputs : [];
    if (!outputsArr.length) return null;
    return {
      label: selectedNodeData?.title || selectedNodeData?.label || selectedNodeId,
      value: selectedNodeId,
      children: outputsArr.map((o: any) => ({
        label: o.key,
        value: `${selectedNodeId}.${o.id}`,
        type: o.type || "string",
        isReference: true,
      })),
    };
  }, [selectedNodeData, selectedNodeId]);
  const autocompleteOptions = useMemo(() => {
    if (currentNodeOption) {
      return [currentNodeOption, ...ancestorOptions];
    }
    return ancestorOptions;
  }, [ancestorOptions, currentNodeOption]);

  const dependenciesStr = useMemo(() => (rule.logic?.dependencies || []).join("\n"), [rule.logic?.dependencies]);

  const handleChangeLanguage = useCallback(
    (opt: { label: string; value: string }) => {
      onChange({ logic: baseLogic({ language: opt.value }) });
    },
    [onChange, baseLogic]
  );

  const onChangeCode = useCallback(
    (value: string) => {
      onChange({ logic: baseLogic({ code: value }) });
    },
    [onChange, baseLogic]
  );

  const onChangeDependencies = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange({ logic: baseLogic({ dependencies: e.target.value.split("\n") }) });
    },
    [onChange, baseLogic]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <PanelDialogWrapper
        position="none"
        className={cn(
          "w-[420px] max-h-[78vh] flex flex-col border-border bg-ocr-modal-bg/30 backdrop-blur-[10px] left-auto translate-x-0 translate-y-0 origin-center p-0"
        )}
      >
        <DialogTitle className="sr-only">Configure Custom Rule</DialogTitle>
        <div className="flex-shrink-0 flex items-center gap-2 px-4 pt-4 pb-3 border-b border-border">
          <div className="flex-1 min-w-0">
            <div className="flex items-center w-fit border rounded-md hover:border-border border-muted">
              <input
                value={draftName}
                onChange={(e) => {
                  const val = e.target.value;
                  setDraftName(val);
                  if (val !== rule.name) {
                    onChange({ name: val });
                  }
                }}
                placeholder="Rule name"
                className="h-7 p-1 text-sm w-full bg-transparent outline-none placeholder:text-muted-foreground/50"
                autoFocus
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="ml-auto inline-flex h-6 w-6 items-center justify-center rounded-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition"
            aria-label="Close dialog"
          >
            <XIcon size={14} />
          </button>
        </div>
        <div className="px-4 py-3 flex flex-col gap-5 overflow-y-auto">
          {/* Arguments */}
          <div className="flex flex-col gap-3 pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-sidebar-foreground">Arguments</span>
              <WithTooltip tooltip="Add argument">
                <Button className="size-8 bg-secondary shadow-action-btn-inset" variant="ghost" size="icon" onClick={addArg}>
                  <PlusIcon className="text-foreground" size={16} />
                </Button>
              </WithTooltip>
            </div>
            {currentArgs.length != 0 && (
              <div className="flex flex-col gap-2">
                {currentArgs.map((a, idx) => {
                  const selectedType = { label: a.type, value: a.type };
                  const selectedVal = a.value ? { label: a.value.label, value: a.value.value } : undefined;
                  return (
                    <div key={idx} className="flex items-center ml-3 group">
                      <InputTag.Root variant="emphasized">
                        <AutocompleteTag
                          placeholder="Var Name"
                          selectedOption={{ label: a.key, value: a.key }}
                          onOptionChange={(opt: { label: string; value: string } | null) => updateArg(idx, { key: opt?.label || "" })}
                        />
                      </InputTag.Root>
                      <ConnectionDots className="flex-1 ml-1 h-px text-muted-foreground max-w-3" />
                      <InputTag.Root variant="emphasized" className="ml-1">
                        <IconSelectTag
                          selectedOption={selectedType}
                          onOptionChange={(opt: { label: string; value: string } | null) => updateArg(idx, { type: opt?.value || "string" })}
                        />
                        <AutocompleteTag
                          options={autocompleteOptions}
                          selectedOption={selectedVal}
                          onOptionChange={(opt: { label: string; value: string; isReference?: boolean } | null) => {
                            if (!opt) {
                              updateArg(idx, { value: undefined, isReference: false });
                              return;
                            }
                            updateArg(idx, { value: { label: opt.label, value: opt.value }, isReference: !!opt.isReference });
                          }}
                        />
                      </InputTag.Root>
                      <WithTooltip tooltip="Remove argument">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-4 opacity-0 group-hover:opacity-100 transition ml-2"
                          onClick={() => removeArg(idx)}
                        >
                          <Trash2 className="size-2" />
                        </Button>
                      </WithTooltip>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 pb-4 border-b border-border/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-sidebar-foreground">Logic</span>
            </div>
            <Terminal variant="input" className="h-full flex flex-1 border-none bg-transparent">
              <TerminalHeader className="relative px-0 flex items-center border-none">
                <TerminalTitle>
                  <ChangeLanguage value={language} options={LANGUAGE_OPTIONS} onChange={handleChangeLanguage as any} />
                </TerminalTitle>
                <TerminalCopyBadge className="absolute -top-8 -right-3 bg-background px-3 py-1 font-normal text-popover-foreground border border-border" />
                <TerminalControls className="relative">
                  <ExpandButton />
                  <CopyButton value={rule.logic?.code || ""} />
                </TerminalControls>
              </TerminalHeader>
              <TerminalContent>
                <TerminalEditor
                  language={language}
                  value={rule.logic?.code || ""}
                  onChange={onChangeCode}
                  className="resize-y h-[180px] my-1.5 border-input border overflow-hidden bg-transparent"
                />
              </TerminalContent>
            </Terminal>
            {/* Dependencies */}
            <Terminal variant="input" className="h-full flex flex-1 mt-3 border-none bg-transparent">
              <TerminalHeader className="px-0 flex items-center border-none">
                <TerminalTitle className="flex items-center gap-1">
                  <span className="text-xs font-medium text-sidebar-foreground/70">Dependencies</span>
                  <Button variant="ghost" className="p-0.5 [&_svg]:size-auto" type="button">
                    <HelpCircle size={12} />
                  </Button>
                </TerminalTitle>
                <TerminalControls>
                  <ExpandButton />
                </TerminalControls>
              </TerminalHeader>
              <TerminalContent>
                <Textarea
                  value={dependenciesStr}
                  rows={2}
                  placeholder={"Add dependencies here\ne.g. requests==2.32.0"}
                  className="my-1 border-input border overflow-scroll bg-transparent"
                  onChange={onChangeDependencies}
                />
              </TerminalContent>
            </Terminal>
          </div>
          <div className="pb-4 border-b border-border/60">
            <RuleOutputs outputs={defaultOutputs} />
          </div>
          {/* Handling */}
          <div className="pb-1">
            <RuleHandling
              action={rule.action_on_execution as RuleAction}
              onActionChange={(a) => {
                onChange({ action_on_execution: a });
              }}
              terminateOnFail={!!rule.terminate_on_fail}
              onTerminateOnFailChange={(v) => onChange({ terminate_on_fail: v })}
              defaultRouteEnabled={customRoutingEnabled}
              defaultRouteNodeId={defaultCustomRoute}
              isDefault={customRoutingEnabled && !!rule.isDefault}
              onDefaultChange={(v) => {
                handleDefaultRoutingChange(v, {
                  selectedNodeId,
                  ruleHandleId: customRuleHandleId(rule.id),
                  handlePrefix: CUSTOM_RULE_HANDLE_PREFIX,
                  defaultRoute: defaultCustomRoute,
                  currentAction: rule.action_on_execution,
                  onChange,
                });
              }}
              ruleHandleId={customRuleHandleId(rule.id)}
              selectedNodeId={selectedNodeId}
            />
          </div>
        </div>
      </PanelDialogWrapper>
    </Dialog>
  );
}
