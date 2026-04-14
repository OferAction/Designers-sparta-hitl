import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

import { useCreateFileMutation } from "@/services";
import { getSubflowProject, useCreateSubflowMutation, useCreateSubflowVariables } from "@/services/subflowConfiguratinService";

import type { FileCreateRequest } from "../types";

export const useFileActions = (openInNewTab: boolean = true) => {
  const { toast } = useToast();

  const { folderId } = useParams();
  const queryClient = useQueryClient();

  // const setLastCreatedId = useWorkspaceStore((state) => state.setLastCreatedId);

  const { mutateAsync: createFileMutation, isPending: createFilePending } = useCreateFileMutation();

  const { mutateAsync: createConfiguration } = useCreateSubflowVariables();
  const { mutateAsync: createSubflowMutation, isPending: createSubflowPending } = useCreateSubflowMutation();

  const addUntitledFile = () => {
    const newFile: FileCreateRequest = {
      name: "Untitled Workflow",
      description: "",
      projectId: folderId,
    };
    createFileMutation(newFile, {
      onSuccess: (data) => {
        window.open(`/canvas/${data.projectId}/${data.id}?new=true`, "_blank");
        // Store the ID of the newly created file in the store
        // setLastCreatedId(data.id);

        toast({
          title: "Workflow created",
          description: `The workflow "${data.name}" has been created.`,
        });
      },
    });
  };

  const addUntitledSubflow = async () => {
    const subflows = await queryClient.ensureQueryData(getSubflowProject());
    const newSubflow: FileCreateRequest = {
      name: "Untitled Subflow",
      description: "",
      projectId: subflows[0].id,
    };
    const data = await createSubflowMutation(newSubflow);
    // setLastCreatedId(data.id);
    // Open the newly created subflow with new=true parameter
    if (openInNewTab) {
      window.open(`/canvas/${data.projectId}/${data.id}/subflow?new=true`, "_blank");
    }
    toast({
      title: "Subflow created",
      description: `The subflow "${data.name}" has been created.`,
    });
    return data;
  };

  const handleCreateConfiguration = useCallback(
    async (initialConfig: any, fileId: string) => {
      try {
        const data = await createConfiguration({
          frontendConfigurationSerialized: JSON.stringify(initialConfig),
          $fileId: fileId,
        });
        // window.open(`/canvas/${projectId}/${fileId}/${data.id}/subflow`, "_blank");
        return data;
      } catch {
        toast({
          title: "Failed to create Configuration.",
          variant: "destructive",
        });
      }
    },
    [createConfiguration, toast]
  );

  const addSelectedSubflow = async (initialConfig: any) => {
    const subflows = await queryClient.ensureQueryData(getSubflowProject());
    const newSubflow = {
      name: "Untitled Subflow",
      description: "",
      projectId: subflows[0].id,
    };
    const data = await createSubflowMutation(newSubflow);
    if (initialConfig) {
      const config = await handleCreateConfiguration(initialConfig, data.id);
      data.activeConfigurationId = config?.id;
    }
    toast({
      title: "Subflow created",
      description: `The subflow "${data.name}" has been created.`,
    });
    return data;
  };

  return {
    addUntitledFile,
    createFilePending,
    addUntitledSubflow,
    addSelectedSubflow,
    createSubflowPending,
  };
};
