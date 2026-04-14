import { QueryClient } from "@tanstack/react-query";

import { createApiPostMutation, createApiPutMutation, createApiQuery } from "@/api";
import API_CONFIGS from "@/config/api.config";
import type {
  VersionHistoryResponse,
  ConfigurationUpdateResponse,
  ConfigurationVersion,
  CreateConfigurationPayload,
  UpdateConfigurationPayload,
  LayoutConfigurationResponse,
  LayoutConfigurationPayload,
} from "@/modules/workspace";
import { getFolderFiles } from "@/modules/workspace/services";
import { getFile } from "@/services/fileService";

const apiClientKey = "DEFAULT";
const CONFIG = API_CONFIGS[apiClientKey];

export const getConfigurationHistory = (fileId: string, params?: URLSearchParams) => {
  params?.sort();
  const queryParams = Object.fromEntries(params?.entries() || []);

  return createApiQuery<VersionHistoryResponse>(
    CONFIG.ENDPOINTS.CONFIGURATION_HISTORY(fileId),
    ["configurationHistory", fileId, params?.toString() || ""],
    {
      apiClientKey,
    },
    {
      params: queryParams,
    }
  );
};

export const restoreConfigurationHistory = (configId: string, fileId: string, queryClient: QueryClient) => {
  return createApiPostMutation<string>(CONFIG.ENDPOINTS.CONFIGURATION_RESTORE(configId), {
    mutationKey: ["configurationRestore", configId],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getConfigurationHistory(fileId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getFile(fileId).queryKey,
      });
    },
    apiClientKey,
  });
};

export const createConfiguration = (fileId: string, projectId: string, queryClient: QueryClient) => {
  return createApiPostMutation<ConfigurationUpdateResponse, CreateConfigurationPayload>(CONFIG.ENDPOINTS.CREATE_CONFIGURATION(fileId), {
    mutationKey: ["createConfiguration", fileId],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getFile(fileId).queryKey });
      queryClient.invalidateQueries({ queryKey: getFolderFiles(projectId).queryKey });
      queryClient.invalidateQueries({ queryKey: getConfigurationHistory(fileId).queryKey });
    },
    apiClientKey,
  });
};
export const updateConfiguration = (projectId: string, fileId: string, configId: string, queryClient: QueryClient) => {
  return createApiPutMutation<ConfigurationUpdateResponse, UpdateConfigurationPayload>(CONFIG.ENDPOINTS.UPDATE_CONFIGURATION(configId), {
    mutationKey: ["updateConfiguration", configId],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getFile(fileId).queryKey });
      queryClient.invalidateQueries({ queryKey: getFolderFiles(projectId).queryKey });
      queryClient.invalidateQueries({ queryKey: getConfigurationHistory(fileId).queryKey });
    },
    apiClientKey,
  });
};

export const layoutConfiguration = () => {
  return createApiPostMutation<LayoutConfigurationResponse, LayoutConfigurationPayload>(CONFIG.ENDPOINTS.LAYOUT_CONFIGURATION, {
    mutationKey: ["layoutConfiguration"],
    apiClientKey,
  });
};

export const getConfiguration = (configId: string) => {
  return createApiQuery<ConfigurationVersion>(CONFIG.ENDPOINTS.CONFIGURATION(configId), ["flow", "config", configId], {
    apiClientKey: "DEFAULT",
  });
};

export const getConfigurationByFileId = (fileId: string) => {
  return createApiQuery<ConfigurationVersion>(CONFIG.ENDPOINTS.CONFIGURATION_BY_FILE_ID(fileId), ["flow", "config", fileId], {
    apiClientKey: "DEFAULT",
  });
};
