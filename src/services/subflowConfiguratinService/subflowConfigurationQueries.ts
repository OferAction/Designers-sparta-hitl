import { QueryClient } from "@tanstack/react-query";
import { produce } from "immer";

import { getFile } from "../fileService";
import {
  ContextOptimisticUpdate,
  createApiDeleteMutation,
  createApiPostMutation,
  createApiPutMutation,
  createApiQuery,
  createApiInfiniteQuery,
} from "@/api";
import API_CONFIGS from "@/config/api.config";
import type {
  ConfigurationUpdateResponse,
  ConfigurationVersion,
  CreateConfigurationPayload,
  File,
  FileCreateRequest,
  FileUpdateRequest,
  SubflowInputOutput,
  TemplateResponse,
  TemplatesResponse,
  UpdateConfigurationPayload,
  VersionHistoryResponse,
} from "@/modules/workspace";
const apiClientKey = "DEFAULT";
const CONFIG = API_CONFIGS[apiClientKey];

export const getSubflowProject = () =>
  createApiQuery<TemplatesResponse>(CONFIG.ENDPOINTS.TEMPLATES, ["subflowsProject"], {
    apiClientKey,
  });
export const getSubflowInputsOutputs = (subflowId: string) =>
  createApiQuery<SubflowInputOutput>(CONFIG.ENDPOINTS.SUBFLOW_INPUTS_OUTPUTS(subflowId), ["subflowsInputsOutputs", subflowId], {
    apiClientKey,
    enabled: !!subflowId,
  });
export const getSubflows = () =>
  createApiQuery<TemplatesResponse>(CONFIG.ENDPOINTS.TEMPLATES, ["subflows"], {
    apiClientKey,
  });

export const getSubflowsPage = (pageSize: number) =>
  createApiInfiniteQuery<TemplatesResponse>(
    `${CONFIG.ENDPOINTS.TEMPLATES}`,
    ["subflows", "infinite", pageSize.toString()],
    {
      apiClientKey,
      initialPageParam: 1,
      getNextPageParam: (lastPage: TemplatesResponse, allPages: TemplatesResponse[]) => {
        const container = lastPage?.[0];
        if (!container || !container.files || container.files.length < pageSize) return undefined;
        return allPages.length + 1;
      },
    },
    {
      params: { pageSize },
    }
  );

export const createSubflowMutation = (queryClient: QueryClient) => {
  return createApiPostMutation<File, FileCreateRequest>(CONFIG.ENDPOINTS.FILES, {
    mutationKey: ["createFile"],
    onSuccess: (data) => {
      queryClient.setQueryData(getSubflowProject().queryKey, (oldData) => {
        if (!oldData?.[0]?.files)
          return [
            {
              id: data.projectId,
              name: oldData?.[0]?.name || "",
              description: oldData?.[0]?.description || "",
              isFile: true,
              isSubflow: true,
              files: [data],
              updateTime: new Date().toISOString(),
            },
          ] satisfies TemplatesResponse;

        return [
          {
            ...oldData[0],
            isFile: true,
            isSubflow: true,
            files: [data, ...oldData[0].files],
            updateTime: new Date().toISOString(),
          },
        ] satisfies TemplatesResponse;
      });
      queryClient.invalidateQueries({
        queryKey: getSubflowProject().queryKey,
      });
    },
    apiClientKey,
  });
};

export const updateSubflowMutation = (queryClient: QueryClient, subflowId: string) => {
  return createApiPutMutation<undefined, FileUpdateRequest, ContextOptimisticUpdate<TemplatesResponse>>(CONFIG.ENDPOINTS.SUBFLOW(subflowId), {
    mutationKey: ["updateSubflow", subflowId],
    onMutate: async (variables) => {
      const queryKey = getSubflowProject().queryKey;
      await queryClient.cancelQueries({ queryKey: queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      const newData = produce(previousData, (draft) => {
        const file = { ...variables, updateTime: new Date().toISOString() };
        if (!draft) {
          draft = [
            {
              id: variables.projectId,
              name: variables.name,
              description: variables.description,
              isFile: true,
              files: [file],
              isSubflow: true,
              updateTime: new Date().toISOString(),
            },
          ];
          return;
        }

        const index = draft.findIndex((file) => file.id === variables.projectId);
        if (index !== -1) {
          draft[index].files![0] = Object.assign(draft[index].files![0], file);
        }
      });
      queryClient.setQueryData(queryKey, newData);

      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        const queryKey = getSubflowProject().queryKey;
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getSubflowProject().queryKey,
      });
    },
    apiClientKey,
  });
};
export const createSubflowConfiguration = (fileId: string, queryClient: QueryClient) => {
  return createApiPostMutation<ConfigurationUpdateResponse, CreateConfigurationPayload>(CONFIG.ENDPOINTS.CREATE_SUBFLOW_CONFIGURATION(fileId), {
    mutationKey: ["createSubflowConfiguration", fileId],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getSubflowConfiguration(fileId).queryKey });
      queryClient.invalidateQueries({ queryKey: getSubflows().queryKey });
      //   queryClient.invalidateQueries({ queryKey: getFolderFiles(projectId).queryKey });
      //   queryClient.invalidateQueries({ queryKey: getConfigurationHistory(fileId).queryKey });
    },
    apiClientKey,
  });
};

export const getSubflowConfiguration = (configId: string) => {
  return createApiQuery<ConfigurationVersion>(CONFIG.ENDPOINTS.SUBFLOW_CONFIGURATION(configId), ["subflow", "config", configId], {
    apiClientKey: "DEFAULT",
    enabled: !!configId,
  });
};

export const updateSubflowConfiguration = (fileId: string, configId: string, queryClient: QueryClient) => {
  return createApiPutMutation<ConfigurationUpdateResponse, UpdateConfigurationPayload>(CONFIG.ENDPOINTS.UPDATE_SUBFLOW_CONFIGURATION(configId), {
    mutationKey: ["updateSubflowConfiguration", configId],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getSubflowConfiguration(fileId).queryKey });
      queryClient.invalidateQueries({ queryKey: getSubflows().queryKey });
    },
    apiClientKey,
  });
};

export const createSubflowConfigurationVariables = (queryClient: QueryClient) => {
  return createApiPostMutation<ConfigurationUpdateResponse, CreateConfigurationPayload & { $fileId: string }>(
    CONFIG.ENDPOINTS.CREATE_SUBFLOW_CONFIGURATION_VARIABLES,
    {
      mutationKey: ["createSubflowConfigurationVariables"],
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries({ queryKey: getSubflowConfiguration(variables.$fileId).queryKey });
        queryClient.invalidateQueries({ queryKey: getSubflows().queryKey });
        //   queryClient.invalidateQueries({ queryKey: getFolderFiles(projectId).queryKey });
        //   queryClient.invalidateQueries({ queryKey: getConfigurationHistory(fileId).queryKey });
      },
      apiClientKey,
    }
  );
};

export const deleteSubflow = (subflowId: string, queryClient: QueryClient) => {
  const queryKey = getSubflows().queryKey;
  return createApiDeleteMutation(CONFIG.ENDPOINTS.DELETE_SUBFLOW(subflowId), {
    mutationKey: ["deleteSubflow", subflowId],
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousSubflows = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (previousSubflows: TemplatesResponse | undefined): TemplatesResponse => {
        if (!previousSubflows || !previousSubflows[0]?.files) return [{} as TemplateResponse] as TemplatesResponse;
        const updatedFiles = previousSubflows[0].files.filter((subflow: File) => subflow.id !== subflowId);
        return [
          {
            ...previousSubflows[0],
            files: updatedFiles,
          },
        ];
      });
      return { previousSubflows };
    },
    onError: (_, __, context) => {
      queryClient.setQueryData(queryKey, context?.previousSubflows);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
    apiClientKey,
  });
};
export const getSubflowConfigurationHistory = (fileId: string, params?: URLSearchParams) => {
  params?.sort();
  const queryParams = Object.fromEntries(params?.entries() || []);

  return createApiQuery<VersionHistoryResponse>(
    CONFIG.ENDPOINTS.SUBFLOW_CONFIGURATION_HISTORY(fileId),
    ["configurationSubflowHistory", fileId, params?.toString() || ""],
    {
      apiClientKey,
    },
    {
      params: queryParams,
    }
  );
};
export const restoreSubflowConfigurationHistory = (configId: string, fileId: string, queryClient: QueryClient) => {
  return createApiPostMutation<string>(CONFIG.ENDPOINTS.SUBFLOW_CONFIGURATION_RESTORE(configId), {
    mutationKey: ["subflowConfigurationRestore", configId],
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getSubflowConfigurationHistory(fileId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getFile(fileId).queryKey,
      });
    },
    apiClientKey,
  });
};
