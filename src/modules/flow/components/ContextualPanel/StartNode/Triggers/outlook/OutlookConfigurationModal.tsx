import React from "react";

import { UserIcon, PlusIcon, CaretDownIcon as ChevronDown } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";

import { usePopupAuthListener } from "@/modules/flow/components/ContextualPanel/connectors/hooks/usePopupAuthListener";
import useSetActiveAccount from "@/modules/flow/components/ContextualPanel/connectors/hooks/useSetActiveAccount";

import { OUTLOOK_DEFAULTS } from "./formDefaults";
import { buildOutlookPayload, ensureOutlookOutputs, ensureOutlookInputs, makeOutlookTrigger } from "./helpers";
import { prefillOutlook } from "./prefill";
import { initScheduleDefaults } from "../shared/utils";
import StartEventModalBody from "../StartEventModalBody";
import StartEventScheduleSection from "../StartEventScheduleSection";
import OutlookFilters from "./OutlookFilters";
import OutlookOutputs from "./OutlookOutputs";
import { OutlookIcon } from "@/lib/icons";
import ConnectionDots from "@/components/common/ConnectionDots";
import { InputLabel } from "@/components/common/InputLabel";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { useGetEmailConnectorUsers, useGetEmailConnectorFolders, useMicrosoftAuthorize } from "@/modules/flow/services/connectors/connectorService";
import type { StartNodeTrigger, NodeOutput, NodeIOItem } from "@/modules/flow/types/BaseNodeTypes";
import { createTask, updateTask } from "@/services";
import { useFlowStore } from "@/store";
import { cn } from "@/utils";

import type { OutlookConfigurationModalProps, OutlookFormValues } from "./types";

export default function OutlookConfigurationModal({ onClose, initialTrigger }: OutlookConfigurationModalProps) {
  const { configId = "", fileId = "" } = useParams();
  const [openStart, setOpenStart] = React.useState<boolean>(true);
  const [openFilters, setOpenFilters] = React.useState<boolean>(false);
  const [openOutputs, setOpenOutputs] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const { data: accounts } = useGetEmailConnectorUsers();
  const { mutate: authorize } = useMicrosoftAuthorize();
  const accountSelectRef = React.useRef<HTMLButtonElement | null>(null);
  const [selectedAccountId, setSelectedAccountId] = React.useState<string | null>(null);
  const { handleActiveAccount } = useSetActiveAccount();

  const methods = useForm<OutlookFormValues>({ defaultValues: OUTLOOK_DEFAULTS });
  const { control, handleSubmit, reset, setValue, getValues, trigger } = methods;
  const { data: userFoldersResp } = useGetEmailConnectorFolders(selectedAccountId || "");

  const dynamicFolderOptions = React.useMemo(() => {
    const folders = userFoldersResp?.folders;
    if (!folders || !Array.isArray(folders)) return [];
    return folders.map((f) => ({ value: f.displayName, label: f.displayName }));
  }, [userFoldersResp]);

  React.useEffect(() => {
    if (!dynamicFolderOptions.length) return;
    const current = getValues("folders");
    if (!Array.isArray(current) || current.length === 0) return;
    const allowed = new Set(dynamicFolderOptions.map((o) => o.value));
    const filtered = current.filter((v) => allowed.has(v));
    if (filtered.length !== current.length) {
      setValue("folders", filtered, { shouldDirty: true });
    }
  }, [dynamicFolderOptions, getValues, setValue]);

  // watch used implicitly by form submission; specific watched values no longer needed for disabling submit
  React.useEffect(() => {
    if (!initialTrigger) return;
    const pre = prefillOutlook(initialTrigger);
    reset(pre);
    if (pre.userId) setSelectedAccountId(pre.userId);
  }, [initialTrigger, reset]);

  React.useEffect(() => {
    initScheduleDefaults({
      hasExistingTrigger: !!initialTrigger,
      getValues,
      setValue,
      dateField: "sendDate",
      timeField: "firstInstanceTime",
      timeZoneField: "timeZoneId",
      dateValueKind: "string-ymd",
    });
  }, [initialTrigger, getValues, setValue]);

  usePopupAuthListener({
    autoClose: false,
    onSuccess: (user) => {
      setSelectedAccountId(user.userId);
      setValue("userId", user.userId, { shouldDirty: true });
      setValue("userName", user.userName, { shouldDirty: true });
      setValue("userEmail", user.userEmail, { shouldDirty: true });
    },
  });

  React.useEffect(() => {
    if (selectedAccountId) return;
    const formUserId = getValues("userId");
    const formEmail = getValues("userEmail");
    if (!accounts || accounts.length === 0) return;
    let match = accounts.find((a) => formUserId && a.userId === formUserId);
    if (!match && formEmail) match = accounts.find((a) => a.userEmail === formEmail);
    if (match) {
      setSelectedAccountId(match.userId);
    }
  }, [accounts, selectedAccountId, getValues]);

  const { mutateAsync: createTaskMut } = useMutation(createTask());
  const { mutateAsync: updateTaskMut } = useMutation(updateTask());
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const nodes = useFlowStore((s) => s.nodes);
  const onChange = useFlowStore((s) => s.onChange);

  // Auto-use active Outlook connector account (if previously selected in connector node) when opening this configuration
  React.useEffect(() => {
    if (selectedAccountId) return; // already selected inside modal
    const formUserId = getValues("userId");
    if (formUserId) return; // form already has a user set (prefill or manual)
    if (!accounts || accounts.length === 0) return; // need accounts loaded
    if (!nodes || nodes.length === 0) return;

    // Find any Outlook connector node that already has a userId input value
    const outlookConnector = nodes.find((n) => n?.data?.type === "connector" && n?.data?.name === "outlook");
    if (!outlookConnector) return;
    const userIdInput = Array.isArray(outlookConnector.data?.inputs)
      ? outlookConnector.data.inputs.find((inp) => inp?.key === "userId" && inp?.value?.value)
      : null;
    const existingUserId: string = userIdInput?.value?.value;
    if (!existingUserId) return;
    const acc = accounts.find((a) => a.userId === existingUserId);
    if (!acc) return; // account not in current list (maybe stale) -> skip

    // Set modal state & form values to use this active account
    setSelectedAccountId(acc.userId);
    setValue("userId", acc.userId, { shouldDirty: true });
    setValue("userName", acc.userName, { shouldDirty: true });
    setValue("userEmail", acc.userEmail, { shouldDirty: true });
  }, [accounts, nodes, selectedAccountId, getValues, setValue]);

  const onSubmit = async (data: OutlookFormValues) => {
    const missingAccount = !data.userId && !selectedAccountId;
    const missingFolders = !data.folders || data.folders.length === 0;
    const missingFrom = !data.from || data.from.length === 0;
    const missingSubject = !data.titleContains || data.titleContains.length === 0;
    if (missingAccount || missingFolders || missingFrom || missingSubject) {
      setOpenFilters(true);
      queueMicrotask(() => {
        trigger(["folders", "from", "titleContains", "lookBackValue", "lookBackUnit"] as any);
        if (contentRef.current) {
          const el = contentRef.current.querySelector("[data-error-anchor], .text-destructive");
          if (el && "scrollIntoView" in el) {
            (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      });
      queueMicrotask(() => {
        if (contentRef.current) {
          const el = contentRef.current.querySelector(".text-destructive");
          if (el && "scrollIntoView" in el) {
            (el as HTMLElement).scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = buildOutlookPayload(data, configId, fileId);
      let createdOrUpdatedId: string | undefined;
      if (initialTrigger?.id) {
        const res: any = await updateTaskMut({ id: initialTrigger.id, ...payload });
        createdOrUpdatedId = res?.id || res?.taskId || res?.triggerId || res?.triggers?.[0]?.id || initialTrigger.id;
      } else {
        const res: any = await createTaskMut(payload);
        createdOrUpdatedId = res?.id || res?.taskId || res?.triggerId || res?.triggers?.[0]?.id;
      }

      const selectedNode = nodes.find((n) => n.id === selectedNodeId);
      if (selectedNode) {
        const prev = (selectedNode.data?.triggers || []) as StartNodeTrigger[];
        const newTrigger = makeOutlookTrigger(data, createdOrUpdatedId || initialTrigger?.id);
        const updated = initialTrigger ? prev.map((t) => (t.id === initialTrigger.id ? newTrigger : t)) : [...prev, newTrigger];
        onChange(selectedNodeId, "triggers", updated);

        const existingOutputs = (selectedNode.data?.outputs || []) as NodeOutput[];
        const nextOutputs = ensureOutlookOutputs(existingOutputs);
        if (nextOutputs.length !== existingOutputs.length) {
          onChange(selectedNodeId, "outputs", nextOutputs);
        }

        const existingInputs = (selectedNode.data?.inputs || []) as NodeIOItem[];
        const nextInputs = ensureOutlookInputs(existingInputs);
        if (nextInputs.length !== existingInputs.length) {
          onChange(selectedNodeId, "inputs", nextInputs);
        }
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true}>
      <FormProvider {...methods}>
        <StartEventModalBody
          title="Start Event Configuration"
          onClose={onClose}
          onSubmit={handleSubmit(onSubmit)}
          contentRef={contentRef}
          isSubmitting={isSubmitting}
          lockClose
          sourceSection={
            <>
              <Label className="text-sm text-muted-foreground">Source</Label>
              <div className="flex mt-1  items-center justify-between">
                <div className="flex items-center gap-1">
                  <InputLabel icon={<OutlookIcon className="size-4" />} variant="emphasized">
                    Outlook
                  </InputLabel>
                  <ConnectionDots />
                  <div className="relative">
                    <InputLabel
                      icon={<UserIcon />}
                      variant="emphasized"
                      className={cn(
                        "hover:text-foreground",
                        !selectedAccountId && methods.formState.submitCount > 0 && "border-destructive text-destructive"
                      )}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        accountSelectRef.current?.click();
                      }}
                    >
                      {selectedAccountId ? accounts?.find((a) => a.userId === selectedAccountId)?.userEmail || "Account" : "Connect Account"}
                    </InputLabel>
                    <Select
                      value={selectedAccountId || undefined}
                      onValueChange={(v) => {
                        setSelectedAccountId(v);
                        const acc = accounts?.find((a) => a.userId === v);
                        if (acc) {
                          setValue("userId", acc.userId, { shouldDirty: true });
                          setValue("userName", acc.userName, { shouldDirty: true });
                          setValue("userEmail", acc.userEmail, { shouldDirty: true });
                          handleActiveAccount(acc);
                        }
                      }}
                    >
                      <SelectTrigger ref={accountSelectRef} className="absolute inset-0 opacity-0 pointer-events-none h-0 w-0 p-0 m-0" />
                      <SelectContent className="w-60 top-6 p-0 bg-background border-border">
                        {accounts && accounts.length > 0 ? (
                          accounts.map((acc) => (
                            <SelectItem
                              key={acc.userId}
                              value={acc.userId}
                              className={cn(
                                "px-3 py-2.5 flex flex-col items-start gap-0 rounded-none border-b last:border-b-0 border-border/40 focus:bg-secondary text-foreground"
                              )}
                            >
                              <span className="block text-sm font-medium text-foreground leading-tight">{acc.userDisplayName}</span>
                              <span className="block text-xs text-muted-foreground leading-tight mt-0.5">{acc.userEmail}</span>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="px-3 py-3 text-xs text-muted-foreground">No accounts</div>
                        )}
                        <button
                          type="button"
                          className="w-full text-left px-3 py-2.5 flex items-center gap-2 cursor-pointer text-primary hover:bg-secondary"
                          onClick={(e) => {
                            e.preventDefault();
                            authorize();
                          }}
                        >
                          <PlusIcon className="size-4" />
                          <span className="text-sm font-medium">Add new account</span>
                        </button>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </>
          }
        >
          <Collapsible open={openStart} onOpenChange={setOpenStart}>
            <div>
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full py-2">
                  <span className="text-sm font-medium">Start Event</span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", openStart ? "rotate-[-180deg]" : "rotate-[-90deg]", "text-muted-foreground")}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-2 space-y-3">
                  <StartEventScheduleSection
                    control={control}
                    contentRef={contentRef}
                    fieldNames={{
                      date: "sendDate",
                      time: "firstInstanceTime",
                      repeatType: "repeatType",
                      repeatValue: "repeatValue",
                      repeatUnit: "repeatUnit",
                      timeZone: "timeZoneId",
                    }}
                    parseDate={(s) => (s ? new Date(`${s}T00:00:00`) : undefined)}
                    formatDate={(d) => {
                      const y = d.getFullYear();
                      const m = String(d.getMonth() + 1).padStart(2, "0");
                      const day = String(d.getDate()).padStart(2, "0");
                      return `${y}-${m}-${day}`;
                    }}
                  />
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>

          <Collapsible open={openFilters} onOpenChange={setOpenFilters}>
            <div>
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full py-2">
                  <span className="text-sm font-medium">Filters (AND)</span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", openFilters ? "rotate-[-180deg]" : "rotate-[-90deg]", "text-muted-foreground")}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <OutlookFilters control={control} folderOptions={dynamicFolderOptions} />
              </CollapsibleContent>
            </div>
          </Collapsible>

          <Collapsible open={openOutputs} onOpenChange={setOpenOutputs}>
            <div>
              <CollapsibleTrigger asChild>
                <button className="flex items-center justify-between w-full py-2">
                  <span className="text-sm font-medium">Outputs</span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", openOutputs ? "rotate-[-180deg]" : "rotate-[-90deg]", "text-muted-foreground")}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <OutlookOutputs />
              </CollapsibleContent>
            </div>
          </Collapsible>
        </StartEventModalBody>
      </FormProvider>
    </Dialog>
  );
}
