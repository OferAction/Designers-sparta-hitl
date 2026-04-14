import { useToast } from "@/hooks/use-toast";

import { DeletionPrompt } from "../../components/card-dialogs";
import { useRestoreArchivedFile, useRestoreArchivedFileFromFolder } from "@/modules/workspace/services";
import { DropdownItem, File } from "@/modules/workspace/types";
import { useDeleteFileMutation } from "@/services";

export const useArchivedFileItem = (file: File, isInsideFolder: boolean = false) => {
  const { mutate: restoreFileMutation } = useRestoreArchivedFile(file);
  const { mutate: restoreFileInsideFolderMutation } = useRestoreArchivedFileFromFolder(file);
  const { mutate: deleteFile } = useDeleteFileMutation(file);
  const { toast } = useToast();
  const handleRestore = () => {
    if (isInsideFolder) {
      restoreFileInsideFolderMutation(undefined, {
        onSuccess: () => {
          toast({
            title: "Workflow restored",
            description: `The workflow "${file.name}" has been restored.`,
          });
        },
        onError: () => {
          toast({
            title: "Error restoring workflow",
            description: `There was an error restoring the workflow "${file.name}".`,
            variant: "destructive",
          });
        },
      });
    } else {
      restoreFileMutation(undefined, {
        onSuccess: () => {
          toast({
            title: "Workflow restored",
            description: `The workflow "${file.name}" has been restored.`,
          });
        },
        onError: () => {
          toast({
            title: "Error restoring workflow",
            description: `There was an error restoring the workflow "${file.name}".`,
            variant: "destructive",
          });
        },
      });
    }
  };
  const handleDelete = () => {
    deleteFile(undefined, {
      onSuccess: () => {
        toast({
          title: "Workflow deleted",
          description: `The workflow "${file.name}" has been permanently deleted.`,
        });
      },
      onError: () => {
        toast({
          title: "Error deleting workflow",
          description: `There was an error deleting the workflow "${file.name}".`,
          variant: "destructive",
        });
      },
    });
  };
  const dropdownItems: DropdownItem[] = [
    { label: "Restore", onClick: handleRestore },
    { label: "Permanent Delete", onClick: () => <DeletionPrompt onSubmit={handleDelete} name={file.name} /> },
  ];

  return {
    dropdownItems,
  };
};
