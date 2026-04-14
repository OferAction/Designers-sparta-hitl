import { useCallback, useEffect, useRef } from "react";

import { generatePath, useNavigate, useParams } from "react-router-dom";

import { useToast } from "@/hooks/use-toast";

import { initialConfig } from "@/modules/flow/constants";
import type { Edge } from "@/modules/flow/types";
import { Node } from "@/modules/flow/types/BaseNodeTypes";
import { useCurrentPath } from "@/routes";
import { useCreateConfiguration, useGetConfiguration, useGetFileQuery } from "@/services";
import { useFlowStore } from "@/store";

export const useLoadActiveConfiguration = () => {
  const currentParams = useParams();
  const currentParamsRef = useRef(currentParams);

  const { fileId = "", folderId = "", configId = "", subflowConfigId = "" } = currentParams;
  const { mutate: createConfiguration, isPending } = useCreateConfiguration(fileId, folderId);
  const { data, isSuccess, isError, isLoading: configurationLoading } = useGetConfiguration(subflowConfigId || configId);
  const { data: fileData, isSuccess: fileIsSuccess, isError: fileIsError, isLoading } = useGetFileQuery(fileId);

  const route = useCurrentPath();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    currentParamsRef.current = currentParams;
  }, [currentParams]);

  const routeToConfiguration = useCallback(
    (updates: Partial<Record<string, string>>) => {
      const pattern = route || "/canvas/:folderId/:fileId/:configId";

      const mergedParams = { ...currentParamsRef.current, ...updates };

      const path = generatePath(pattern, mergedParams);
      navigate(path, { replace: true });
    },
    [navigate, route]
  );

  const handleCreateConfiguration = useCallback(() => {
    createConfiguration(
      {
        frontendConfigurationSerialized: JSON.stringify(initialConfig),
      },
      {
        onSuccess: (data) => {
          routeToConfiguration({
            folderId,
            fileId: data.fileId,
            configId: data.id,
            subflowConfigId,
          });
          useFlowStore.getState().setNodes(initialConfig.config.parameters.nodes as Node[]);
          useFlowStore.getState().setEdges(initialConfig.config.parameters.edges as Edge[]);
        },

        onError: () => {
          toast({
            title: "Failed to create Configuration.",
            variant: "destructive",
          });
        },
      }
    );
  }, [createConfiguration, routeToConfiguration, folderId, subflowConfigId, toast]);

  useEffect(() => {
    if (fileData && fileData.id !== fileId) {
      return;
    }

    // if there is a config id, try to fetch it
    if (configId) {
      // if success just load it
      // DEBT: this means that if a valid config id that's not inside the file is passed, it will load it
      // which is useful in case of history, but need to manage to not load it if we are opening in canvas editing mode
      // and also only load configurations that are inside the file history in history mode.
      if (isSuccess) {
        return;
      }
      // if failed => get the fileData.activeConfigurationId and fetch it
      if (isError) {
        if (!fileIsSuccess) return;

        // if the fileData.activeConfigurationId is present, navigate to it
        if (fileData.activeConfigurationId) {
          routeToConfiguration({
            folderId: fileData.projectId,
            fileId: fileData.id,
            configId: fileData.activeConfigurationId,
            subflowConfigId,
          });
          return;
        }

        // if the fileData.activeConfigurationId is not present, create a new config
        handleCreateConfiguration();
      }
    } else {
      // if there is no config id, check if there is an active config id in the file data
      if (isLoading) return;

      if (fileIsSuccess) {
        // if there is an active config id, fetch it and load it
        if (fileData.activeConfigurationId) {
          routeToConfiguration({
            folderId: fileData.projectId,
            fileId: fileData.id,
            configId: fileData.activeConfigurationId,
            subflowConfigId,
          });
        } else {
          // if there is no active config id, create a new config
          handleCreateConfiguration();
        }
      }

      if (fileIsError) {
        toast({
          title: "Failed to load file.",
          variant: "destructive",
        });
      }
    }
  }, [
    configId,
    fileData,
    fileId,
    fileIsError,
    fileIsSuccess,
    handleCreateConfiguration,
    isError,
    isLoading,
    isSuccess,
    routeToConfiguration,
    subflowConfigId,
    toast,
  ]);

  return { file: data, isLoading: configurationLoading || isLoading || isPending };
};
