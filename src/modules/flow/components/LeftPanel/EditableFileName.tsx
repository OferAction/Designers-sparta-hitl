import { useState, useEffect } from "react";

import { useParams, useSearchParams } from "react-router-dom";

import { useParentFileId } from "@/hooks/useFileCache";

import { EditableField, EditableFieldProvider } from "@/components/common/EditableField";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BranchStatus } from "@/modules/flow/components/BranchStatus";
import { useGetFileQuery, useUpdateFileInsideCanvas } from "@/services";
import { useGetSubflowConfiguration } from "@/services/subflowConfiguratinService";

export const EditableFileName = () => {
  const { fileId: paramsFileId = "", subflowConfigId } = useParams();
  const [searchParams] = useSearchParams();

  const [fileId] = useParentFileId(paramsFileId);
  const { data: subflowConfig } = useGetSubflowConfiguration(subflowConfigId || "");
  const { data: file, isSuccess } = useGetFileQuery(subflowConfigId ? subflowConfig?.fileId || "" : fileId);

  const [isEditing, setIsEditing] = useState(false);
  const { mutate: updateFile } = useUpdateFileInsideCanvas(subflowConfigId ? subflowConfig?.fileId || "" : fileId);

  const isNewlyCreated = searchParams.get("new") === "true";

  useEffect(() => {
    if (isSuccess && isNewlyCreated) {
      setIsEditing(true);
    }
  }, [isSuccess, file, isNewlyCreated]);

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

  const isPublished = isSuccess && file?.status === "Live";

  const currentValue = file?.name || "Loading...";
  return (
    <div className="flex items-center justify-center h-7 bottom-full gap-x-1 min-h-0 min-w-0 ">
      {isSuccess && <BranchStatus isPublished={isPublished} />}
      <EditableFieldProvider
        value={{
          onEditEnd: handleFileName,
          isEditing: isEditing && isSuccess,
          onEditingChange: handleEditingChange,
          // Add auto-focus configuration
          autoFocusOnEdit: isNewlyCreated,
          selectTextOnFocus: true,
        }}
      >
        <EditableField currentValue={currentValue} className="w-full min-w-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="cursor-pointer max-w-[12rem] overflow-hidden" onClick={handleEditStart}>
                  <span className="font-semibold block truncate">{currentValue}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[12rem] break-words">
                {currentValue}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </EditableField>
      </EditableFieldProvider>
    </div>
  );
};
