import { useToast } from "@/hooks/use-toast";

import { useWorkspaceStore } from "../store";
import { ProjectCreateRequest } from "../types";
import { useCreateFolderMutation } from "@/modules/workspace/services";

export const useFolderActions = () => {
  const { toast } = useToast();
  const setLastCreatedId = useWorkspaceStore(state => state.setLastCreatedId);

  const { mutate: addFolderMutation, isPending: addFolderPending } = useCreateFolderMutation();

  const addUntitledFolder = () => {
    const newFolder: ProjectCreateRequest = {
      name: "Untitled Project",
      description: "",
    };

    addFolderMutation(newFolder, {
      onSuccess: (data) => {
        // Store the ID of the newly created folder in the store
        setLastCreatedId(data.id);

        toast({
          title: "Project created",
          description: `The project "${data.name}" has been created.`,
        });
      },
    });
  };

  return {
    addUntitledFolder,
    addFolderPending,
  };
};
