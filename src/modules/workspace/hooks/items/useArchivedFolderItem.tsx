import { useNavigate } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

import { DeletionPrompt } from "@/modules/workspace/components/card-dialogs";
import { useDeleteFolderMutation, useRestoreArchivedFolder } from "@/modules/workspace/services";
import { DropdownItem, Project } from "@/modules/workspace/types";

export const useArchivedFolderItem = (folder: Project) => {
  const navigate = useNavigate();
  const { mutate: restoreFolder } = useRestoreArchivedFolder(folder.id);
  const { mutate: deleteFolder } = useDeleteFolderMutation(folder.id);
  const { toast } = useToast();

  const handleClick = () => {
    navigate(`/archive/folder/${folder.id}`);
  };

  const handleRestore = () => {
    restoreFolder();
  };

  function handleDeleteFolder() {
    deleteFolder(undefined, {
      onSuccess: () => {
        toast({
          title: "Project deleted",
          description: `The project "${folder.name}" has been permanently deleted.`,
        });
      },
      onError: () => {
        toast({
          title: "Error deleting project",
          description: `There was an error deleting the project "${folder.name}".`,
          variant: "destructive",
        });
      },
    });
  }

  const dropdownItems: DropdownItem[] = [
    { label: "Restore", onClick: handleRestore },
    { label: "Permanent Delete", onClick: () => <DeletionPrompt onSubmit={handleDeleteFolder} name={folder.name} /> },
  ];

  return {
    dropdownItems,
    handleClick,
  };
};
