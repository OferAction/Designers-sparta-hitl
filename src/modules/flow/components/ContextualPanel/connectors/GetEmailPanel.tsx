import React from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MultiInput from "@/components/ui/multi-input";
import { MultiSelect } from "@/components/ui/multi-select";
import { useSelectedNode } from "@/modules/flow/hooks";
import { NodeVariant } from "@/modules/flow/types";
import { useFlowStore } from "@/store";
import { genId } from "@/utils";

const folderOptions = [
  { value: "Inbox", label: "Inbox" },
  { value: "Sent Items", label: "Sent Items" },
  { value: "Drafts", label: "Drafts" },
  { value: "Archive", label: "Archive" },
  { value: "Spam", label: "Spam" },
];

function GetEmailPanel({ nodeId }: { nodeId?: string }) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const onChange = useFlowStore((state) => state.onChange);
  const nodes = useFlowStore((state) => state.nodes);
  const selectedFromStore = useSelectedNode<NodeVariant<"connector", "outlook">>();
  const selectedNode = nodeId ? (nodes.find((n) => n.id === nodeId) as NodeVariant<"connector", "outlook"> | undefined) : selectedFromStore;
  const inputsArray = Array.isArray(selectedNode?.data.inputs) ? selectedNode?.data.inputs : [];

  const getArrayVal = (key: "folders" | "from"): string[] => (inputsArray.find((i) => i.key === key)?.value?.value as string[] | undefined) ?? [];

  const getStringVal = (key: "subjectContains"): string =>
    (inputsArray.find((i) => i.key === (key as string))?.value?.value as string | undefined) ?? "";

  const setArrayVal = (key: "folders" | "from", values: string[]) => {
    if (!selectedNode?.id) return;
    const current = Array.isArray(selectedNode.data.inputs) ? selectedNode.data.inputs : [];
    let found = false;
    const newInputs = current.map((it: any) => {
      if (it.key === key) {
        found = true;
        const existingLabel = it?.value?.label;
        return { ...it, type: "List of Strings", value: { label: existingLabel, value: values } } as any;
      }
      return it;
    });
    if (!found) newInputs.push({ id: `${key}_${genId()}`, key, type: "List of Strings", value: { label: "", value: values } } as any);
    onChange(selectedNode.id, "inputs", newInputs);
  };

  const setStringVal = (key: "subjectContains", value: string) => {
    if (!selectedNode?.id) return;
    const current = Array.isArray(selectedNode.data.inputs) ? selectedNode.data.inputs : [];
    let found = false;
    const newInputs = current.map((it: any) => {
      if (it.key === (key as string)) {
        found = true;
        const existingLabel = it?.value?.label;
        return { ...it, type: "String", value: { label: existingLabel, value } } as any;
      }
      return it;
    });
    if (!found) newInputs.push({ id: `${key}_${genId()}`, key, type: "String", value: { label: "", value } } as any);
    onChange(selectedNode.id, "inputs", newInputs);
  };

  return (
    <div ref={containerRef} className="flex flex-col gap-3">
      <div className="space-y-1">
        <Label>Folder</Label>
        <MultiSelect
          modalPopover
          options={folderOptions}
          onValueChange={(vals) => setArrayVal("folders", vals)}
          placeholder="Choose folders..."
          variant="secondary"
          className="bg-background"
          defaultValue={getArrayVal("folders")}
          container={containerRef.current}
        />
      </div>
      <div className="space-y-1">
        <Label>Sender Email</Label>
        <MultiInput
          placeholder="Type email and press Enter, supports multiple"
          className="bg-background"
          defaultValue={getArrayVal("from")}
          onValueChange={(vals) => setArrayVal("from", vals)}
          validate={(v) => /.+@.+\..+/.test(v)}
        />
      </div>
      <div className="space-y-1">
        <Label>Subject Contains</Label>
        <Input
          placeholder="Ex: Invoice"
          className="bg-background"
          value={getStringVal("subjectContains")}
          onChange={(e) => setStringVal("subjectContains", e.target.value)}
        />
      </div>
    </div>
  );
}

export default GetEmailPanel;
