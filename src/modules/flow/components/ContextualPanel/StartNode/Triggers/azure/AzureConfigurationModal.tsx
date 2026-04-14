import React from "react";

import { PlugIcon, CaretDownIcon as ChevronDown } from "@phosphor-icons/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, FormProvider } from "react-hook-form";
import { useParams } from "react-router-dom";

import AzureFilters from "./AzureFilters";
import AzureOutputs from "./AzureOutputs";
import { AZURE_DEFAULTS } from "./formDefaults";
import { buildAzurePayload, ensureAzureOutputs, makeAzureTrigger } from "./helpers";
import { prefillAzure } from "./prefill";
import { initScheduleDefaults } from "../shared/utils";
import StartEventModalBody from "../StartEventModalBody";
import StartEventScheduleSection from "../StartEventScheduleSection";
import { InputLabel } from "@/components/common/InputLabel";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { Dialog } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import type { StartNodeTrigger, NodeOutput } from "@/modules/flow/types/BaseNodeTypes";
import { storageAccountsListQuery, createTask, updateTask } from "@/services";
import { useFlowStore } from "@/store";
import { cn } from "@/utils";

import type { AzureConfigurationModalProps, AzureFormValues } from "./types";

export default function AzureConfigurationModal({ onClose, initialTrigger }: AzureConfigurationModalProps) {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [openStart, setOpenStart] = React.useState<boolean>(true);
  const [openFilters, setOpenFilters] = React.useState<boolean>(false);
  const [openOutputs, setOpenOutputs] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { configId: configurationId = "", fileId = "" } = useParams();

  const methods = useForm<AzureFormValues>({ defaultValues: AZURE_DEFAULTS });
  const { control, handleSubmit, reset, setValue, getValues } = methods;
  const [accountName, setAccountName] = React.useState<string | null>(null);
  const accountSelectRef = React.useRef<HTMLButtonElement | null>(null);
  const accountsQ = useQuery(storageAccountsListQuery());
  // Save button always enabled; validation errors shown after submit attempt

  React.useEffect(() => {
    if (!initialTrigger) return;
    const pre = prefillAzure(initialTrigger);
    reset(pre);
    if (pre.storageAccountName) {
      setAccountName(pre.storageAccountName);
    }
  }, [initialTrigger, reset]);

  React.useEffect(() => {
    initScheduleDefaults({
      hasExistingTrigger: !!initialTrigger,
      getValues,
      setValue,
      dateField: "firstInstance",
      timeField: "firstInstanceTime",
      timeZoneField: "timeZone",
      dateValueKind: "date-object",
    });
  }, [initialTrigger, getValues, setValue]);

  const { mutateAsync: createTaskMut } = useMutation(createTask());
  const { mutateAsync: updateTaskMut } = useMutation(updateTask());
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const nodes = useFlowStore((s) => s.nodes);
  const onChange = useFlowStore((s) => s.onChange);

  const onSubmit = async (data: AzureFormValues) => {
    // Guard required fields even if filters section stayed collapsed
    const missingAccount = !data.storageAccountName && !accountName;
    const missingContainer = !data.container;
    const missingPattern = !data.filePattern;
    if (missingAccount || missingContainer || missingPattern) {
      // open filters section to show errors
      setOpenFilters(true);
      queueMicrotask(() => {
        if (contentRef.current) {
          const errorEl = contentRef.current.querySelector("[data-error-anchor], .text-destructive") as HTMLElement | null;
          if (errorEl && typeof errorEl.scrollIntoView === "function") {
            errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = buildAzurePayload(data, configurationId || "", fileId);

      let createdOrUpdatedId: string | undefined;
      if (initialTrigger?.id) {
        const res: any = await updateTaskMut({ id: initialTrigger.id, ...payload });
        createdOrUpdatedId = res?.id;
      } else {
        const res: any = await createTaskMut(payload);
        createdOrUpdatedId = res?.id;
      }
      const selectedNode = nodes.find((n) => n.id === selectedNodeId);
      if (selectedNode) {
        const prev = ((selectedNode.data as any)?.triggers || []) as StartNodeTrigger[];
        const newTrigger: StartNodeTrigger = makeAzureTrigger(data as any, createdOrUpdatedId || initialTrigger?.id);
        const updated = initialTrigger ? prev.map((t) => (t.id === initialTrigger.id ? newTrigger : t)) : [...prev, newTrigger];
        onChange(selectedNodeId, "triggers", updated);

        const existingOutputs = ((selectedNode.data as any)?.outputs || []) as NodeOutput[];
        const nextOutputs: NodeOutput[] = ensureAzureOutputs(existingOutputs);
        if (nextOutputs.length !== existingOutputs.length) {
          onChange(selectedNodeId, "outputs", nextOutputs);
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
              <div className="flex mt-1">
                <div className="relative">
                  <InputLabel
                    icon={<PlugIcon />}
                    variant="emphasized"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      accountSelectRef.current?.click();
                    }}
                    className={cn(!accountName && methods.formState.submitCount > 0 && "border-destructive text-destructive")}
                  >
                    {accountName ? accountName : "Azure account"}
                  </InputLabel>
                  <Select
                    value={accountName || undefined}
                    onValueChange={(v) => {
                      setAccountName(v);
                      setValue("storageAccountName", v, { shouldDirty: true });
                    }}
                    disabled={accountsQ.isLoading}
                  >
                    <SelectTrigger ref={accountSelectRef} className="absolute inset-0 opacity-0 pointer-events-none h-0 w-0 p-0 m-0" />
                    <SelectContent className="w-64 p-0 top-6 bg-background border-border">
                      {accountsQ.data && accountsQ.data.length > 0 ? (
                        accountsQ.data.map((acc) => (
                          <SelectItem
                            key={acc.accountName}
                            value={acc.accountName}
                            className="px-3 py-2.5 flex flex-col items-start gap-0 rounded-none focus:bg-secondary focus:text-foreground text-foreground"
                          >
                            <span className="text-sm font-medium leading-tight">{acc.accountName}</span>
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-3 py-3 text-xs text-muted-foreground">No accounts</div>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </>
          }
        >
          <div className="border-b border-border pb-4">
            <Collapsible open={openStart} onOpenChange={setOpenStart}>
              <div>
                <CollapsibleTrigger asChild>
                  <button type="button" className="flex items-center justify-between w-full py-2">
                    <span className="text-sm font-medium">Start Event</span>
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", openStart ? "rotate-[-180deg]" : "rotate-[-90deg]", "text-muted-foreground")}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-3 space-y-4">
                    <StartEventScheduleSection
                      control={control}
                      contentRef={contentRef}
                      fieldNames={{
                        date: "firstInstance",
                        time: "firstInstanceTime",
                        repeatType: "repeats",
                        repeatValue: "repeatValue",
                        repeatUnit: "repeatUnit",
                        timeZone: "timeZone",
                      }}
                      parseDate={(d) => (d instanceof Date ? d : undefined)}
                      formatDate={(d) => d}
                    />
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          <div className="border-b border-border pb-4">
            <Collapsible open={openFilters} onOpenChange={setOpenFilters}>
              <div>
                <CollapsibleTrigger asChild>
                  <button type="button" className="flex items-center justify-between w-full py-2">
                    <span className="text-sm font-medium">File Filters</span>
                    <ChevronDown
                      className={cn("h-4 w-4 transition-transform", openFilters ? "rotate-[-180deg]" : "rotate-[-90deg]", "text-muted-foreground")}
                    />
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <AzureFilters control={control} accountName={accountName} submitCount={methods.formState.submitCount} />
                </CollapsibleContent>
              </div>
            </Collapsible>
          </div>

          <Collapsible open={openOutputs} onOpenChange={setOpenOutputs}>
            <div>
              <CollapsibleTrigger asChild>
                <button type="button" className="flex items-center justify-between w-full py-2">
                  <span className="text-sm font-medium">Outputs</span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", openOutputs ? "rotate-[-180deg]" : "rotate-[-90deg]", "text-muted-foreground")}
                  />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <AzureOutputs />
              </CollapsibleContent>
            </div>
          </Collapsible>
        </StartEventModalBody>
      </FormProvider>
    </Dialog>
  );
}
