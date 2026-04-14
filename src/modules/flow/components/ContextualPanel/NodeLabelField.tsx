import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import { EditableField } from "@/components/common/EditableField";
import { EditableFieldProvider } from "@/components/common/EditableField";
import { mitt } from "@/lib/mitt";
import { useSelectedNode } from "@/modules/flow/hooks";
import { useGetFileQuery, useUpdateFileInsideCanvas } from "@/services";
import { useGetSubflowConfiguration } from "@/services/subflowConfiguratinService";
import { useFlowStore } from "@/store";

import { cn } from "@/utils/tw-clsx";

import { NodeIconsMapping } from "@/constants/NodesConstants";

const NodeTextField: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => {
  return (
    <h2 className={cn("text-lg leading-7 py-0.5 px-2 font-medium text-sidebar-foreground truncate min-w-0 w-full", className)} {...props}>
      {children}
    </h2>
  );
};

const InnerWorkflowLabelField = () => {
  const { fileId = "", subflowConfigId } = useParams();

  const { data: subflowConfig } = useGetSubflowConfiguration(subflowConfigId || "");
  const { data: file, isSuccess } = useGetFileQuery(subflowConfigId ? subflowConfig?.fileId || "" : fileId);
  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateFile } = useUpdateFileInsideCanvas(subflowConfigId ? subflowConfig?.fileId || "" : fileId);

  const handleFileName = (newName: string) => {
    if (!file) return;
    updateFile({ ...file, name: newName });
    setIsEditing(false);
  };

  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);
  };

  const handleEditStart = () => {
    setIsEditing(true);
  };

  const currentValue = file?.name || "Loading...";

  return (
    <div className="flex items-center min-w-0 flex-1">
      <EditableFieldProvider
        value={{
          onEditEnd: handleFileName,
          isEditing: isEditing && isSuccess,
          onEditingChange: handleEditingChange,
          selectTextOnFocus: true,
        }}
      >
        <EditableField
          currentValue={currentValue}
          className="flex mr-2 w-full min-w-0"
          inputClassName="py-0.5 px-1 truncate min-w-0 flex-1 bg-transparent"
        >
          <NodeTextField className="cursor-pointer" onClick={handleEditStart}>
            {currentValue}
          </NodeTextField>
        </EditableField>
      </EditableFieldProvider>
    </div>
  );
};

const InnerNodeLabelField = () => {
  const selectedNode = useSelectedNode();
  const onChange = useFlowStore((state) => state.onChange);
  const [isEditing, setIsEditing] = useState(false);

  const currentLabel = selectedNode?.data?.label || selectedNode?.id || "";

  useEffect(() => {
    const handleFocusLabel = ({ nodeId }: { nodeId: string }) => {
      if (selectedNode?.id === nodeId && !["start", "end"].includes(selectedNode?.data?.type)) {
        setIsEditing(true);
      }
    };

    mitt.on("node:double-click:focus-label", handleFocusLabel);
    return () => {
      mitt.off("node:double-click:focus-label", handleFocusLabel);
    };
  }, [selectedNode?.data?.type, selectedNode?.id]);

  const handleLabelChange = (newLabel: string) => {
    if (selectedNode?.id && newLabel !== selectedNode.data?.label) {
      onChange(selectedNode.id, "label", newLabel);
    }
    setIsEditing(false);
  };

  const handleEditingChange = (editing: boolean) => {
    setIsEditing(editing);
  };
  const handleEditStart = () => {
    setIsEditing(true);
  };
  return (
    <div className="flex items-center min-w-0 flex-1">
      <EditableFieldProvider
        value={{
          onEditEnd: handleLabelChange,
          isEditing: isEditing,
          onEditingChange: handleEditingChange,
          onEditStart: handleEditStart,
        }}
      >
        <EditableField
          currentValue={currentLabel}
          className="flex mr-2 w-full min-w-0"
          inputClassName="py-0.5 px-1 truncate min-w-0 flex-1 bg-transparent"
        >
          <NodeTextField className="cursor-pointer" onClick={handleEditStart}>
            {currentLabel}
          </NodeTextField>
        </EditableField>
      </EditableFieldProvider>
    </div>
  );
};

export function NodeLabelField() {
  const selectedNode = useSelectedNode();
  if (!selectedNode) return <InnerWorkflowLabelField />;

  const { name, title } = selectedNode?.data || {};
  const Icon = name ? NodeIconsMapping[name] : null;

  if (selectedNode.data?.type === "start" || selectedNode.data?.type === "end") {
    return (
      <div className="flex items-center min-w-0">
        {Icon && <Icon className="min-w-6 h-6 text-foreground duration-[800ms] ease-in-out flex-shrink-0" />}
        <NodeTextField>{title}</NodeTextField>
      </div>
    );
  }

  return (
    <>
      <InnerNodeLabelField />
    </>
  );
}
