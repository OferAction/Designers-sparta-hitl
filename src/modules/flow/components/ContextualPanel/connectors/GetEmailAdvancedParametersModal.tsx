import React from "react";

import { XIcon, CheckIcon } from "@phosphor-icons/react";
import { Controller, useForm } from "react-hook-form";

import { useUpsertInput } from "./hooks/useUpsertInput";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MultiInput from "@/components/ui/multi-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant, OutlookInputType } from "@/modules/flow/types";
import { useFlowStore } from "@/store";
import { cn } from "@/utils";

import {
  MESSAGE_STATUS_OPTIONS,
  HAS_ATTACHMENTS_OPTIONS,
  ALLOWED_FILE_TYPES_OPTIONS,
  MAX_EMAILS_TO_RETURN_OPTIONS,
} from "@/constants/DropdownOptions";

interface GetEmailAdvancedParametersModal {
  id: string;
  onClose: () => void;
  nodeId?: string;
}

export default function GetEmailAdvancedParametersModal({ onClose, nodeId }: GetEmailAdvancedParametersModal) {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const onChange = useFlowStore((s) => s.onChange);
  const nodes = useFlowStore((s) => s.nodes);
  const selectedFromStore = useSelectedNode<NodeVariant<"connector", "outlook">>();
  const selectedNode = nodeId ? (nodes.find((n) => n.id === nodeId) as NodeVariant<"connector", "outlook"> | undefined) : selectedFromStore;
  const upsert = useUpsertInput();
  const data = selectedNode?.data;
  const inputsArray = React.useMemo(() => (Array.isArray(data?.inputs) ? data?.inputs : []), [data?.inputs]);

  const getInputValue = React.useCallback(
    <T,>(key: string, fallback: T): T => {
      const item = inputsArray.find((i) => i.key === key);
      return (item?.value?.value as T) ?? fallback;
    },
    [inputsArray]
  );

  const getArrayVal = React.useCallback(
    (key: string): string[] => {
      const v = getInputValue(key, []);
      return Array.isArray(v) ? v : v ? [String(v)] : [];
    },
    [getInputValue]
  );

  const formatYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const parseLocalDate = (s?: string) => (s ? new Date(`${s}T00:00:00`) : undefined);

  type FormValues = {
    messageStatus: string;
    dateFrom: string;
    dateTo: string;
    filterTo: string;
    cc: string[];
    bcc: string[];
    bodyContains: string;
    hasAttachments: string;
    allowedFileTypes: string;
    minSizeMB: string;
    maxSizeMB: string;
    maxEmailsToReturn: string;
    includeSubfolders: boolean;
    markAsReadAfterProcessing: boolean;
  };

  const defaultValues: FormValues = React.useMemo(
    () => ({
      messageStatus: getInputValue<string | "">("messageStatus", ""),
      dateFrom: getInputValue<string | "">("dateFrom", ""),
      dateTo: getInputValue<string | "">("dateTo", ""),
      filterTo: getInputValue<string | "">("filterTo", ""),
      cc: getArrayVal("cc"),
      bcc: getArrayVal("bcc"),
      bodyContains: getInputValue<string | "">("bodyContains", ""),
      hasAttachments: getInputValue<string | "">("hasAttachments", ""),
      allowedFileTypes: getInputValue<string | "">("allowedFileTypes", ""),
      minSizeMB: String(getInputValue<number | "">("minSizeMB", "")),
      maxSizeMB: String(getInputValue<number | "">("maxSizeMB", "")),
      maxEmailsToReturn: getInputValue<number | "">("maxEmailsToReturn", "")?.toString() ?? "",
      includeSubfolders: getInputValue<boolean>("includeSubfolders", false),
      markAsReadAfterProcessing: getInputValue<boolean>("markAsReadAfterProcessing", false),
    }),
    [getInputValue, getArrayVal]
  );

  const { control, register, handleSubmit, reset, watch, formState } = useForm<FormValues>({ defaultValues });
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = (values: FormValues) => {
    if (!selectedNode) return onClose();
    const current = Array.isArray(data?.inputs) ? (data.inputs as OutlookInputType[]) : [];

    let newInputs = [...current];
    newInputs = upsert(newInputs, "messageStatus", "String", values.messageStatus || "");
    newInputs = upsert(newInputs, "dateFrom", "String", values.dateFrom || "");
    newInputs = upsert(newInputs, "dateTo", "String", values.dateTo || "");
    newInputs = upsert(newInputs, "filterTo", "String", values.filterTo || "");
    newInputs = upsert(newInputs, "cc", "List of Strings", values.cc || []);
    newInputs = upsert(newInputs, "bcc", "List of Strings", values.bcc || []);
    newInputs = upsert(newInputs, "bodyContains", "String", values.bodyContains || "");
    newInputs = upsert(newInputs, "hasAttachments", "String", values.hasAttachments || "");
    newInputs = upsert(newInputs, "allowedFileTypes", "String", values.allowedFileTypes || "");
    newInputs = upsert(newInputs, "minSizeMB", "Number", values.minSizeMB === "" ? "" : Number(values.minSizeMB));
    newInputs = upsert(newInputs, "maxSizeMB", "Number", values.maxSizeMB === "" ? "" : Number(values.maxSizeMB));
    if (values.maxEmailsToReturn !== "") {
      newInputs = upsert(newInputs, "maxEmailsToReturn", "Integer", Number(values.maxEmailsToReturn));
    }
    newInputs = upsert(newInputs, "includeSubfolders", "Boolean", !!values.includeSubfolders);
    newInputs = upsert(newInputs, "markAsReadAfterProcessing", "Boolean", !!values.markAsReadAfterProcessing);

    onChange(selectedNode.id, "inputs", newInputs);
  };

  const isSaved = !formState.isDirty;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent
        ref={contentRef}
        className={cn(
          "max-w-[25rem] max-h-[90vh] border-border block bg-ocr-modal-bg/30 backdrop-blur-[10px] left-auto translate-x-0 translate-y-0 origin-center top-[14px] right-[427px]",
          "data-[state=closed]:!slide-out-to-right-full data-[state=closed]:!slide-out-to-top-0 data-[state=open]:!slide-in-from-right-full data-[state=open]:!slide-in-from-top-0 data-[state=closed]:!zoom-out-100 data-[state=open]:!zoom-in-100 data-[state=open]:!animate-z-index-slide-in data-[state=closed]:z-[5] !duration-200 px-0 py-0"
        )}
        overlayProps={{ className: "bg-transparent pointer-events-none" }}
        hideCloseButton={true}
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-border">
          <DialogTitle className="text-sm text-card-foreground">Advanced Parameters</DialogTitle>
          <DialogClose className="p-1.5 rounded transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
            <XIcon className="h-4 w-4" />
          </DialogClose>
        </div>
        <div className="p-4 overflow-y-auto" style={{ maxHeight: "calc(80vh - 90px)" }}>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Message Status</Label>
                <Controller
                  name="messageStatus"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={cn("bg-background", !field.value && "text-muted-foreground")}>
                        <SelectValue placeholder="Ex: read only" />
                      </SelectTrigger>
                      <SelectContent>
                        {MESSAGE_STATUS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt === "all" ? "All" : opt === "read" ? "Read only" : "Unread only"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Date from</Label>
                  <Controller
                    name="dateFrom"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={parseLocalDate(field.value)}
                        onChange={(d) => field.onChange(d ? formatYYYYMMDD(d) : "")}
                        formatDate={(d) => formatYYYYMMDD(d)}
                        container={contentRef.current}
                      />
                    )}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date to</Label>
                  <Controller
                    name="dateTo"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        value={parseLocalDate(field.value)}
                        onChange={(d) => field.onChange(d ? formatYYYYMMDD(d) : "")}
                        formatDate={(d) => formatYYYYMMDD(d)}
                        container={contentRef.current}
                      />
                    )}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>To</Label>
                <Input className="bg-background" placeholder="Ex: example@Action.com" {...register("filterTo")} />
              </div>

              <div className="space-y-2">
                <Label>CC</Label>
                <Controller
                  name="cc"
                  control={control}
                  render={({ field }) => (
                    <MultiInput
                      className="bg-background"
                      placeholder="Type email and press Enter"
                      defaultValue={field.value ?? []}
                      onValueChange={field.onChange}
                      validate={(v) => /.+@.+\..+/.test(v)}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>BCC</Label>
                <Controller
                  name="bcc"
                  control={control}
                  render={({ field }) => (
                    <MultiInput
                      className="bg-background"
                      placeholder="Type email and press Enter"
                      defaultValue={field.value ?? []}
                      onValueChange={field.onChange}
                      validate={(v) => /.+@.+\..+/.test(v)}
                    />
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Body Contains</Label>
                <Input className="bg-background" placeholder="Ex: Final invoice, els" {...register("bodyContains")} />
              </div>

              <div className="space-y-2">
                <Label>Has Attachments</Label>
                <Controller
                  name="hasAttachments"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className={cn("bg-background", !field.value && "text-muted-foreground")}>
                        <SelectValue placeholder="Both" />
                      </SelectTrigger>
                      <SelectContent>
                        {HAS_ATTACHMENTS_OPTIONS.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {(watch("hasAttachments") === "Yes" || watch("hasAttachments") === "Both") && (
                <>
                  <div className="space-y-2">
                    <Label>Allowed File Types</Label>
                    <Controller
                      name="allowedFileTypes"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className={cn("bg-background", !field.value && "text-muted-foreground")}>
                            <SelectValue placeholder="Ex: PDF, DOCX, JPG" />
                          </SelectTrigger>
                          <SelectContent>
                            {ALLOWED_FILE_TYPES_OPTIONS.map((t) => (
                              <SelectItem key={t} value={t}>
                                {t}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Min Size(MB)</Label>
                      <Input type="number" className="bg-background" placeholder="Ex: 20" {...register("minSizeMB")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Max Size (MB)</Label>
                      <Input type="number" className="bg-background" placeholder="Ex: 20" {...register("maxSizeMB")} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Max Emails to Return</Label>
                    <Controller
                      name="maxEmailsToReturn"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value?.toString() ?? ""} onValueChange={field.onChange}>
                          <SelectTrigger className={cn("bg-background", (field.value ?? "") === "" && "text-muted-foreground")}>
                            <SelectValue placeholder="Ex: 50" />
                          </SelectTrigger>
                          <SelectContent>
                            {MAX_EMAILS_TO_RETURN_OPTIONS.map((v) => (
                              <SelectItem key={v} value={String(v)}>
                                {v}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2 pt-3">
                <div className="flex items-center gap-3">
                  <Controller
                    name="includeSubfolders"
                    control={control}
                    render={({ field }) => (
                      <Checkbox id="include-subfolders" checked={!!field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                    )}
                  />
                  <Label htmlFor="include-subfolders">Include Subfolders</Label>
                </div>
                <p className="text-xs text-muted-foreground">Also search any subfolders within the selected folders</p>
              </div>

              <div className="space-y-2 pt-3">
                <div className="flex items-center gap-3">
                  <Controller
                    name="markAsReadAfterProcessing"
                    control={control}
                    render={({ field }) => <Checkbox id="mark-read" checked={!!field.value} onCheckedChange={(c) => field.onChange(c === true)} />}
                  />
                  <Label htmlFor="mark-read">Mark as Read After Processing</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Mark messages as 'read' after they have been successfully fetched to prevent them from being processed again.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-border p-4 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={handleSubmit(onSubmit)} disabled={isSaved} aria-live="polite">
            {isSaved ? (
              <span className="inline-flex items-center gap-1">
                <CheckIcon className="h-4 w-4" /> Saved
              </span>
            ) : (
              "Save"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
