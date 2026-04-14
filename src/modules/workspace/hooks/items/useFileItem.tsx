import { MouseEvent, useRef, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";
import { useParentFileId } from "@/hooks/useFileCache";

import { ShareDialog, VersionHistoryModal } from "../../components/card-dialogs";
import { useDuplicateProject } from "../../services";
import { useWorkspaceStore } from "../../store";
import { useArchiveFile, useArchiveFileInsideFolder, useDuplicateFile, useUpdateFileInsideFolderMutation, useUpdateFileMutation } from "@/services";
import { ENTITY_TYPE } from "@/types/accessRequest";

import type { File } from "../../types";

export const useFileItem = (file: File, isInsideFolder: boolean = false) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { mutate: updateFile } = useUpdateFileMutation(file);
  const { mutate: updateFileInsideFolder } = useUpdateFileInsideFolderMutation(file);

  const { mutate: archiveFileMutation } = useArchiveFile(file);
  const { mutate: archiveFileInsideFolderMutation } = useArchiveFileInsideFolder(file);
  const { mutate: duplicateFileMutation } = useDuplicateFile(file.id);
  const { mutate: duplicateFolderMutation } = useDuplicateProject(file.projectId);
  const [parentFileId] = useParentFileId(file.id);

  const lastCreatedId = useWorkspaceStore((state) => state.lastCreatedId);
  const setLastCreatedId = useWorkspaceStore((state) => state.setLastCreatedId);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(lastCreatedId === file.id);

  const handleNameChange = (newName: string) => {
    if (isInsideFolder) {
      updateFileInsideFolder(
        { ...file, name: newName },
        {
          onSuccess: (_, variables) => {
            toast({
              title: "Workflow updated",
              description: `The workflow "${variables.name}" has been updated.`,
            });
          },
        }
      );
    } else {
      updateFile(
        { ...file, name: newName },
        {
          onSuccess: (_, variables) => {
            toast({
              title: "Workflow updated",
              description: `The workflow "${variables.name}" has been updated.`,
            });
          },
        }
      );
    }

    setLastCreatedId(null);
  };

  const handleEditingChange = (isEditing: boolean) => {
    setIsEditing(isEditing);

    if (!isEditing) {
      setLastCreatedId(null);
    }
  };

  const handleClick = async (e: MouseEvent<HTMLDivElement>) => {
    if (isEditing) {
      e.stopPropagation();
    } else {
      window.open(`/canvas/${file.projectId}/${file.id}`, "_blank");
    }
  };

  const handleCopyLink = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/canvas/${file.projectId}/${file.id}`);
    toast({
      title: "Link copied",
      description: "The link to the workflow has been copied to your clipboard.",
      position: "center",
    });
  };

  const handleArchiveFile = () => {
    if (isInsideFolder) {
      archiveFileInsideFolderMutation(undefined, {
        onSuccess: () => {
          toast({
            title: "Workflow archived",
            description: `The workflow "${file.name}" has been archived.`,
          });
        },
      });
    } else {
      archiveFileMutation(undefined, {
        onSuccess: () => {
          toast({
            title: "Workflow archived",
            description: `The workflow "${file.name}" has been archived.`,
          });
        },
      });
    }
  };
  const handleDuplicateFile = () => {
    if (isInsideFolder) {
      duplicateFileMutation(
        { fileId: file.id, projectId: file.projectId },
        {
          onSuccess: (data) => {
            toast({
              title: "Workflow duplicated",
              description: `The workflow "${data?.name || file.name}" has been duplicated.`,
            });

            window.scrollTo({ top: 0, behavior: "smooth" });
          },
        }
      );
    } else {
      duplicateFolderMutation(undefined, {
        onSuccess: (data) => {
          if (data.isFile === true) {
            toast({
              title: "Workflow duplicated",
              description: `The workflow "${data.files[0].name}" has been duplicated.`,
            });

            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        },
      });
    }
  };

  const handleShareWorkflow = () => (
    <ShareDialog entityType={ENTITY_TYPE.File} entityId={file.id} entityName={file.name} entityLink={`/canvas/${file.projectId}/${file.id}`} />
  );

  const dropdownItems = [
    { label: "Open workflow", onClick: handleClick },
    {
      label: "Monitoring",
      onClick: () => navigate(`canvas/${file.projectId}/${parentFileId}/${file.activeConfigurationId}/monitoring`),
      disabled: file.status !== "Live",
    },
    { separator: true },
    { label: "Copy link", onClick: handleCopyLink },
    { label: "Share workflow", onClick: handleShareWorkflow },
    { label: "Duplicate", onClick: handleDuplicateFile },
    { separator: true },
    {
      label: "Show version history",
      onClick: () => <VersionHistoryModal file={file} />,
    },
    {
      label: "Rename",
      onClick: () => setIsEditing(true),
      onCloseAutoFocus: () => {
        // Target the specific input by its unique ID
        const input = cardRef.current?.querySelector<HTMLInputElement>(`[data-editable-field-input="${file.id}"]`);
        input?.focus();
      },
    },
    { separator: true },
    { label: "Move to archive", onClick: handleArchiveFile },
  ];

  return { dropdownItems, isEditing, setIsEditing, cardRef, handleNameChange, handleClick, handleEditingChange };
};
