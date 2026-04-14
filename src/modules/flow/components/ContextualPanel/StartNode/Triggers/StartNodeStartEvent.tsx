import React from "react";

import { PlusIcon, TrashIcon, PlugIcon } from "@phosphor-icons/react";
import { useMutation } from "@tanstack/react-query";

import { FieldRow } from "./shared/FieldRow";
import { getRepeatTextFromSettings } from "./shared/utils";
import StartEventConfigurationModal from "./StartEventConfigurationModal";
import { OutlookIcon } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import { SectionContainer } from "@/modules/flow/components/ContextualPanel/SectionContainer";
import { SectionTitle } from "@/modules/flow/components/ContextualPanel/SectionTitle";
import { useSelectedNode } from "@/modules/flow/hooks";
import type { NodeVariant, StartNodeTrigger } from "@/modules/flow/types";
import { deleteTask, TRIGGER_TYPES } from "@/services";
import { useDialogStoreActions, useFlowStore } from "@/store";

export const StartNodeStartEvent = ({ children }: { children?: React.ReactNode }) => {
  const { openDialog } = useDialogStoreActions();
  const selectedNode = useSelectedNode<NodeVariant<"start">>();
  const triggers = (selectedNode?.data?.triggers as StartNodeTrigger[] | undefined) || [];
  const selectedNodeId = useFlowStore((s) => s.selectedNodeId);
  const onChange = useFlowStore((s) => s.onChange);
  const { mutateAsync: deleteTaskMut } = useMutation(deleteTask());
  const [isConfigOpen, setIsConfigOpen] = React.useState(false);
  function handleDialog() {
    if (isConfigOpen) return; // prevent multiple opens
    setIsConfigOpen(true);
    openDialog(({ id, onClose }) => (
      <StartEventConfigurationModal
        id={id}
        onClose={() => {
          setIsConfigOpen(false);
          onClose();
        }}
      />
    ));
  }
  function handleEdit(t: StartNodeTrigger) {
    if (isConfigOpen) return;
    setIsConfigOpen(true);
    openDialog(({ id, onClose }) => (
      <StartEventConfigurationModal
        id={id}
        onClose={() => {
          setIsConfigOpen(false);
          onClose();
        }}
        initialTrigger={t}
      />
    ));
  }
  const getRepeatText = (t: StartNodeTrigger) => getRepeatTextFromSettings((t.settings || {}) as any);

  const getStartModeText = (_t: StartNodeTrigger) => {
    return "scheduled";
  };
  async function handleDelete(t: StartNodeTrigger) {
    try {
      if (t.id) await deleteTaskMut({ id: t.id });
    } catch (e) {
      console.warn("Failed to delete task", e);
    }
    if (selectedNodeId) {
      const remaining = triggers.filter((x) => x.id !== t.id);
      onChange(selectedNodeId, "triggers", remaining);

      const requireOutlook = remaining.some((rt) => rt.type === TRIGGER_TYPES.EmailTrigger);
      const requireAzure = remaining.some((rt) => rt.type === TRIGGER_TYPES.AzureTrigger);
      const requiredKeys = new Set<string>();
      if (requireOutlook) {
        requiredKeys.add("body");
        requiredKeys.add("attachment");
        requiredKeys.add("attachments");
      }
      if (requireAzure) {
        requiredKeys.add("attachment");
      }

      const selectedNodeData: any = selectedNode?.data;
      const existingOutputs = ((selectedNodeData?.outputs as any[]) || []) as { id: string; key: string }[];
      const nextOutputs = existingOutputs.filter((o) => {
        const isTriggerProvided = o.id === o.key && (o.key === "body" || o.key === "attachment" || o.key === "attachments");
        if (!isTriggerProvided) return true;
        return requiredKeys.has(o.key);
      });
      if (nextOutputs.length !== existingOutputs.length) {
        onChange(selectedNodeId, "outputs", nextOutputs as any);
      }

      const existingInputs = ((selectedNodeData?.inputs as any[]) || []) as { id: string; key: string }[];
      const nextInputs = existingInputs.filter((i) => {
        const isTriggerProvided = i.id === i.key && (i.key === "body" || i.key === "attachments");
        if (!isTriggerProvided) return true;
        return requiredKeys.has(i.key);
      });
      if (nextInputs.length !== existingInputs.length) {
        onChange(selectedNodeId, "inputs", nextInputs as any);
      }
    }
  }
  return (
    <SectionContainer>
      <SectionTitle title="Triggers" tooltip="Define the event that starts this flow" />

      {triggers.length === 0 ? (
        <Button
          onClick={handleDialog}
          variant="secondary"
          className="flex items-center justify-center w-full text-sm text-primary disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isConfigOpen}
        >
          Add Start Event
          <PlusIcon size={12} className="text-foreground" />
        </Button>
      ) : (
        <div className="space-y-4">
          {triggers.map((t) => {
            const isOutlook = t.type === TRIGGER_TYPES.EmailTrigger;
            const settings: any = t.settings || {};
            const email = settings.userEmail;
            const name = settings.userName || t.account;
            const displayAccount = isOutlook
              ? (typeof email === "string" && email.includes("@") ? email : name) || "—"
              : t.account || settings.storageAccountName || "—";
            const accountValue = (
              <div className="flex items-center gap-2">
                {isOutlook ? <OutlookIcon className="size-4" /> : <PlugIcon size={14} />}
                <span className="truncate">{displayAccount}</span>
              </div>
            );
            const startModeValue = <span className="capitalize">{getStartModeText(t)}</span>;
            const repeatsValue = <span>{getRepeatText(t)}</span>;
            const senderValue = t.sender && t.sender.length > 0 ? t.sender.join(", ") : "From";
            const attachmentValue = t.hasAttachment != null ? (t.hasAttachment ? "True" : "False") : "True";

            const Row = ({ label, value }: { label: React.ReactNode; value: React.ReactNode }) => <FieldRow label={label} value={value} />;

            return (
              <div key={t.id}>
                <div className="flex items-stretch justify-between">
                  <div
                    className="flex flex-col gap-1.5 w-full pr-3 cursor-pointer group"
                    role="button"
                    tabIndex={0}
                    onClick={() => handleEdit(t)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleEdit(t);
                      }
                    }}
                  >
                    <Row label="Account" value={accountValue} />
                    <Row label="Start event when" value={startModeValue} />
                    {isOutlook && <Row label="Sender" value={senderValue} />}
                    {isOutlook && <Row label="Attachment" value={attachmentValue} />}
                    <Row label="Repeats" value={repeatsValue} />
                  </div>
                  <div className="flex items-stretch text-muted-foreground group/button">
                    <button
                      className="h-full flex items-center justify-center px-1 rounded-md hover:bg-accent/70  transition-colors"
                      onClick={() => handleDelete(t)}
                      aria-label="Delete trigger"
                    >
                      <TrashIcon className="group-hover/button:text-destructive" size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {children}
    </SectionContainer>
  );
};
export default StartNodeStartEvent;
