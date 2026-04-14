import { MouseEvent, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

import { ShareDialog } from "@/modules/workspace/components/card-dialogs";
import { useArchiveFolderMutation, useDuplicateProject, useUpdateFolderMutation } from "@/modules/workspace/services";
import { useWorkspaceStore } from "@/modules/workspace/store";
import { Project } from "@/modules/workspace/types";
import { ENTITY_TYPE } from "@/types/accessRequest";

export const useFolderCard = (folder: Project) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const lastCreatedId = useWorkspaceStore((state) => state.lastCreatedId);
  const setLastCreatedId = useWorkspaceStore((state) => state.setLastCreatedId);

  const [isEditing, setIsEditing] = useState(lastCreatedId === folder.id);

  const { mutate: updateFolder } = useUpdateFolderMutation(folder.id);
  const { mutate: archiveFolderMutation } = useArchiveFolderMutation(folder.id);
  const { mutate: duplicateFolderMutation } = useDuplicateProject(folder.id);

  const handleClick = () => {
    if (folder?.isSubflow) {
      navigate(`/templates`);
    } else {
      navigate(`/folder/${folder.id}`);
    }
  };

  const handleNameChange = (newName: string) => {
    updateFolder({ ...folder, name: newName });
    setLastCreatedId(null);
  };

  const handleEditingChange = (isEditing: boolean) => {
    setIsEditing(isEditing);

    if (!isEditing) {
      setLastCreatedId(null);
    }
  };

  const handleCopyLink = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(`${window.location.origin}/folder/${folder.id}`);
    toast({
      title: "Link copied",
      description: "The link to the project has been copied to your clipboard.",
      position: "center",
    });
  };

  const handleArchiving = () => {
    archiveFolderMutation();
  };
  const handleDuplicateFolder = () => {
    duplicateFolderMutation(undefined, {
      onSuccess: (data) => {
        toast({
          title: "Project duplicated",
          description: `The project "${data?.name || folder.name}" has been duplicated.`,
        });

        window.scrollTo({ top: 0, behavior: "smooth" });
      },
    });
  };
  const dropdownItems = [
    { label: "Open project", onClick: () => navigate(`/folder/${folder.id}`) },
    { separator: true },
    { label: "Copy link", onClick: handleCopyLink },
    {
      label: "Share project",
      onClick: () => (
        <ShareDialog entityType={ENTITY_TYPE.Project} entityId={folder.id} entityName={folder.name} entityLink={`/folder/${folder.id}`} />
      ),
    },
    { label: "Duplicate", onClick: handleDuplicateFolder },
    { separator: true },
    {
      label: "Rename",
      onClick: () => setIsEditing(true),
      onCloseAutoFocus: () => {
        // Target the specific input by its unique ID
        const input = document.querySelector<HTMLInputElement>(`[data-editable-field-input="${folder.id}"]`);
        input?.focus();
      },
    },
    { separator: true },
    { label: "Move to archive", onClick: handleArchiving },
  ];

  return { dropdownItems, isEditing, setIsEditing, handleNameChange, handleClick, handleEditingChange };
};
