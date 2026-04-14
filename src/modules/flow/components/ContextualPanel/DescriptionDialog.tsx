import React, { useCallback } from "react";

import { useSelectedNode } from "@/modules/flow/hooks/useSelectedNode";

import { DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Textarea from "@/components/ui/textarea";
import { useFlowStore } from "@/store";

const DescriptionDialog: React.FC = () => {
  const selectedNode = useSelectedNode();
  const selectedNodeId = selectedNode?.id;
  const onChange = useFlowStore((state) => state.onChange);
  const description = selectedNode?.data.description;

  const handleDescriptionChange: React.ChangeEventHandler<HTMLTextAreaElement> = useCallback(
    (event) => {
      const value = event.target.value || "";
      if (selectedNodeId) {
        onChange(selectedNodeId, "description", value);
      }
    },
    [selectedNodeId, onChange]
  );

  return (
    <div>
      <DialogTitle className="pb-4">Component Configuration</DialogTitle>
      <div>
        <div>
          <div className="flex justify-between items-center mb-1 min-h-0">
            <Label>Description</Label>
            <span>{description?.length || 0}/100</span>
          </div>
          <Textarea value={description} onChange={handleDescriptionChange} maxLength={100} className="min-h-0 resize-y overflow-auto max-h-[40vh]" />
        </div>
      </div>
    </div>
  );
};

export default DescriptionDialog;
