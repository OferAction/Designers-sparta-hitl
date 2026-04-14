import React, { useMemo } from "react";

import { UploadSimpleIcon, XIcon, CheckIcon } from "@phosphor-icons/react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { useAncestorValueOptions } from "@/modules/flow/hooks/useAncestorValueOptions";

import { useUpsertInput } from "./hooks/useUpsertInput";
import { FileTypeIcon as IconFile } from "@/lib/icons";
import { Loader } from "@/components/common/Loader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import type { Option } from "@/components/ui/input-tag";
import { Label } from "@/components/ui/label";
import MultiInput from "@/components/ui/multi-input";
import { MultiSelect } from "@/components/ui/multi-select";
import TimePicker from "@/components/ui/time-picker";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant } from "@/modules/flow/types";
import { useUploadFile } from "@/services/uploadService/uploadService";
import { useFlowStore } from "@/store";
import { cn } from "@/utils";

interface SendEmailAdvancedParametersModalProps {
  id: string;
  onClose: () => void;
  nodeId?: string;
}
export default function SendEmailAdvancedParametersModal({ onClose, nodeId }: SendEmailAdvancedParametersModalProps) {
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const onChange = useFlowStore((s) => s.onChange);
  const nodes = useFlowStore((s) => s.nodes);
  const selectedFromStore = useSelectedNode<NodeVariant<"connector", "outlook">>();
  const selectedNode = nodeId ? (nodes.find((n) => n.id === nodeId) as NodeVariant<"connector", "outlook"> | undefined) : selectedFromStore;
  const upsert = useUpsertInput();
  const data = (selectedNode?.data as any) || undefined;
  const inputsArray: any[] = React.useMemo(() => (Array.isArray(data?.inputs) ? (data?.inputs as any[]) : []), [data?.inputs]);

  const getInputValue = React.useCallback(
    <T,>(key: string, fallback: T): T => {
      const item = inputsArray.find((i) => i.key === key);
      return (item?.value?.value as T) ?? fallback;
    },
    [inputsArray]
  );

  const selectedNodeId = selectedNode?.id ?? "";
  const ancestorValueOptions = useAncestorValueOptions(selectedNodeId);
  const ancestorGroups = useMemo(() => {
    if (!selectedNodeId)
      return [] as { heading: string; options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[] }[];
    return ancestorValueOptions
      .map((group: Option) => {
        const fileChildren = (group?.children || []).filter((c: any) => c.type === "File" || c.type === "List of Files");
        if (!fileChildren.length) return null;
        const heading = group?.label;
        const options = fileChildren.map((c: any) => ({
          label: c.label,
          value: c.value,
          icon: c.icon as React.ComponentType<{ className?: string }> | undefined,
        }));
        return { heading, options };
      })
      .filter(Boolean) as { heading: string; options: { label: string; value: string; icon?: React.ComponentType<{ className?: string }> }[] }[];
  }, [ancestorValueOptions, selectedNodeId]);

  const getArrayVal = React.useCallback(
    (key: string): string[] => {
      const v = getInputValue<any>(key, []);
      return Array.isArray(v) ? v : v ? [String(v)] : [];
    },
    [getInputValue]
  );

  type FormValues = {
    cc: string[];
    bcc: string[];
    referencedAttachments: string[];
    attachments: string[];
    sendDate: string;
    sendTime: string;
    outlookSignature: boolean;
  };

  const defaultValues: FormValues = React.useMemo(
    () => ({
      cc: getArrayVal("cc"),
      bcc: getArrayVal("bcc"),
      referencedAttachments: getArrayVal("referencedAttachments"),
      attachments: getArrayVal("attachments"),
      sendDate: getInputValue<string | "">("sendDate", ""),
      sendTime: getInputValue<string | "">("sendTime", ""),
      outlookSignature: getInputValue<boolean>("outlookSignature", false),
    }),
    [getArrayVal, getInputValue]
  );

  const { control, handleSubmit, reset, setValue, getValues, formState } = useForm<FormValues>({ defaultValues });
  React.useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const uploadedAttachmentsWatch = useWatch({ control, name: "attachments" });

  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFile();
  const uploadInputId = React.useId();
  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const filenames = await uploadFiles({ files });
      const current = getValues("attachments") ?? [];
      setValue("attachments", [...current, ...filenames], { shouldDirty: true });
    } finally {
      if (e.target) e.target.value = "";
    }
  };

  const initialAttachmentsKey = React.useMemo(() => (defaultValues.referencedAttachments ?? []).join("|"), [defaultValues.referencedAttachments]);

  const formatYYYYMMDD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };
  const parseLocalDate = (s?: string) => (s ? new Date(`${s}T00:00:00`) : undefined);

  const onSubmit = (values: FormValues) => {
    if (!selectedNode) return onClose();
    const current = Array.isArray(data?.inputs) ? (data.inputs as any[]) : [];

    let newInputs = [...current];
    newInputs = upsert(newInputs, "cc", "List of Strings", values.cc || []);
    newInputs = upsert(newInputs, "bcc", "List of Strings", values.bcc || []);
    newInputs = upsert(newInputs, "attachments", "List of Strings", values.attachments || []);
    newInputs = upsert(newInputs, "referencedAttachments", "List of Strings", values.referencedAttachments || []);
    newInputs = upsert(newInputs, "sendDate", "String", values.sendDate || "");
    newInputs = upsert(newInputs, "sendTime", "String", values.sendTime || "");
    newInputs = upsert(newInputs, "outlookSignature", "Boolean", !!values.outlookSignature);

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
        overlayProps={{ className: "bg-transparent" }}
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
                <Label>Cc</Label>
                <Controller
                  name="cc"
                  control={control}
                  render={({ field }) => (
                    <MultiInput
                      className="bg-background"
                      placeholder="info@example.com"
                      defaultValue={field.value ?? []}
                      onValueChange={field.onChange}
                      validate={(v) => /.+@.+\..+/.test(v)}
                    />
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label>Bcc</Label>
                <Controller
                  name="bcc"
                  control={control}
                  render={({ field }) => (
                    <MultiInput
                      className="bg-background"
                      placeholder="info@example.com"
                      defaultValue={field.value ?? []}
                      onValueChange={field.onChange}
                      validate={(v) => /.+@.+\..+/.test(v)}
                    />
                  )}
                />
              </div>

              <div className="flex flex-col gap-2 items-start">
                <Label>Attachments</Label>
                <Controller
                  name="referencedAttachments"
                  control={control}
                  render={({ field }) => (
                    <MultiSelect
                      key={initialAttachmentsKey}
                      options={ancestorGroups}
                      onValueChange={(vals) => {
                        field.onChange(vals);
                      }}
                      placeholder="Select files"
                      variant="secondary"
                      className="bg-background"
                      defaultValue={field.value ?? []}
                      resetOnDefaultValueChange={false}
                      modalPopover={false}
                      container={contentRef.current}
                    />
                  )}
                />
                <Label>or</Label>
                <input id={uploadInputId} type="file" multiple className="hidden" onChange={handleFilesSelected} />
                <Button asChild variant="secondary" className="gap-2" disabled={isUploading} aria-busy={isUploading}>
                  <label htmlFor={uploadInputId} className="cursor-pointer" role="button" aria-disabled={isUploading} tabIndex={isUploading ? -1 : 0}>
                    {isUploading ? (
                      <>
                        <Loader className="size-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadSimpleIcon className="size-4" />
                        <span>Upload from device</span>
                      </>
                    )}
                  </label>
                </Button>

                {!!(uploadedAttachmentsWatch && uploadedAttachmentsWatch.length) && (
                  <div className="mt-2 w-full space-y-2">
                    {uploadedAttachmentsWatch.map((name: string, idx: number) => (
                      <div key={`${name}_${idx}`} className="flex items-center max-w-[16rem] gap-2 rounded-md border border-border px-3 py-1 text-sm">
                        <IconFile className="size-4 flex-none" />
                        <span className="truncate max-w-[16rem]" title={name}>
                          {name}
                        </span>
                        <button
                          type="button"
                          className="ml-auto inline-flex items-center justify-center rounded-full p-1 hover:text-muted-foreground text-foreground"
                          onClick={() => {
                            const current = getValues("attachments") ?? [];
                            const next = current.filter((n: string, i: number) => !(n === name && i === idx));
                            setValue("attachments", next, { shouldDirty: true });
                          }}
                          aria-label={`Remove ${name}`}
                        >
                          <XIcon className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Send date</Label>
                  <Controller
                    name="sendDate"
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
                  <Label>Send time</Label>
                  <Controller
                    name="sendTime"
                    control={control}
                    render={({ field }) => <TimePicker value={field.value} onChange={field.onChange} />}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-3">
                <div className="flex items-center gap-3">
                  <Controller
                    name="outlookSignature"
                    control={control}
                    render={({ field }) => (
                      <Checkbox id="include-subfolders" checked={!!field.value} onCheckedChange={(c) => field.onChange(c === true)} />
                    )}
                  />
                  <Label htmlFor="include-subfolders">using your Outlook signature</Label>
                </div>
                <p className="text-xs text-muted-foreground">Your Outlook signature will be used automatically when sending the email</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border p-4 flex justify-end gap-2">
          <Button type="submit" variant="secondary" onClick={handleSubmit(onSubmit)} disabled={isSaved} aria-live="polite">
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
