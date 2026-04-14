import { useRef, useState, MouseEvent } from "react";

import { useNavigate } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

import { VersionHistoryModal } from "../../components/card-dialogs";
import { useFileActions } from "../useFileActions";
import { useWorkspaceStore } from "@/modules/workspace/store";
import { useDuplicateTemplate, useUpdateFileInsideFolderMutation } from "@/services";
// import { useDeleteSubflowMutation } from "@/services/subflowConfiguratinService";

import type { File, Project } from "../../types";

type WorkspaceItem = File | Project;

export const useTemplateItem = <T extends WorkspaceItem>(item: T) => {
  const lastCreatedId = useWorkspaceStore((state) => state.lastCreatedId);
  const setLastCreatedId = useWorkspaceStore((state) => state.setLastCreatedId);
  const [isEditing, setIsEditing] = useState(lastCreatedId === item.id);
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { addUntitledSubflow } = useFileActions();
  const { mutate: duplicateFileMutation } = useDuplicateTemplate(item.id);

  const isFolder = (item: WorkspaceItem): item is Project => {
    return "files" in item;
  };
  
  const { mutate: updateFileInsideFolder } = useUpdateFileInsideFolderMutation(item as File);
  // const { mutate: deleteSubflow } = useDeleteSubflowMutation(item.id);

  const handleNameChange = (newName: string) => {
    if (isFolder(item)) return;
    updateFileInsideFolder({ ...item, name: newName } as File, {
      onSuccess: (_, variables) => {
        toast({
          title: `${isFolder(item) ? "Folder" : "Subflow"} updated`,
          description: `The subflow "${variables.name}" has been updated.`,
        });
      },
    });
    setLastCreatedId(null);
  };

  const handleClick = async (e: MouseEvent<HTMLDivElement>) => {
    if (isEditing) {
      e.stopPropagation();
    } else {
      if (isFolder(item)) {
        navigate(`/templates`);
      } else {
        window.open(`/canvas/${item.projectId}/${item.id}/${item.activeConfigurationId || ""}/subflow`, "_blank");
      }
    }
  };

  const handleCopyLink = (e: MouseEvent) => {
    e.stopPropagation();
    if (!isFolder(item)) {
      navigator.clipboard.writeText(`${window.location.origin}/canvas/${item.projectId}/${item.id}/${item.activeConfigurationId || ""}/subflow`);
      toast({
        title: "Link copied",
        description: "The link to the subflow has been copied to your clipboard.",
        position: "center",
      });
    }
  };

  const handleEditingChange = (isEditing: boolean) => {
    setIsEditing(isEditing);

    if (!isEditing) {
      setLastCreatedId(null);
    }
  };
  const handleDuplicateTemplate = () => {
    duplicateFileMutation(
      { fileId: item.id, projectId: isFolder(item) ? item.id : item.projectId },
      {
        onSuccess: (data) => {
          toast({
            title: "Subflow duplicated",
            description: `The subflow "${data?.name || item.name}" has been duplicated.`,
          });
          // Smooth scroll to top so user sees the newly duplicated item (assuming it appears near top)
          if (typeof window !== "undefined" && window.scrollTo) {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        },
      }
    );
  };
  const getDropdownItems = () => {
    if (isFolder(item)) {
      return [
        { label: "Open folder", onClick: handleClick },
        { separator: true },
        {
          label: "New subflow",
          onClick: () => addUntitledSubflow(),
        },
      ];
    } else {
      return [
        { label: "Open subflow", onClick: handleClick },
        { separator: true },
        { label: "Copy link", onClick: handleCopyLink },
        { label: "Share subflow" },
        { label: "Duplicate", onClick: handleDuplicateTemplate },
        { separator: true },
        {
          label: "Show version history",
          onClick: () => <VersionHistoryModal file={item} isSubflowFile={true} />,
        },
        {
          label: "Rename",
          onClick: () => setIsEditing(true),
          onCloseAutoFocus: () => {
            const input = cardRef.current?.querySelector<HTMLInputElement>(`[data-editable-field-input="${item.id}"]`);
            input?.focus();
          },
        },
        // { separator: true },
        // {
        //   label: "Delete",
        //   onClick: () => deleteSubflow(),
        // },
      ];
    }
  };

  const dropdownItems = getDropdownItems();

  return {
    dropdownItems,
    isEditing,
    cardRef,
    handleNameChange,
    handleClick,
    isFolder: isFolder(item),
    handleEditingChange,
  };
};
