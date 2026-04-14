import { QueryClient } from "@tanstack/react-query";
import { produce } from "immer";

import { ContextOptimisticUpdate, createApiDeleteMutation, createApiPostMutation, createApiPutMutation, createApiQuery } from "@/api";
import API_CONFIGS from "@/config/api.config";
import { getArchivedFolderFiles, getFolderFiles, getFolders } from "@/modules/workspace/services";
import { getArchivedFolders } from "@/modules/workspace/services";
import type {
  ProjectsResponse,
  FileCreateRequest,
  File,
  Project,
  TopFile,
  FileUpdateRequest,
  systemRules,
  RulesRouteConfig,
} from "@/modules/workspace/types";
import { getSubflowProject, getSubflows } from "@/services/subflowConfiguratinService";

const apiClientKey = "DEFAULT";
const CONFIG = API_CONFIGS[apiClientKey];

export const createFileInsideFolderMutation = (queryClient: QueryClient) => {
  return createApiPostMutation<File, FileCreateRequest>(CONFIG.ENDPOINTS.FILES, {
    mutationKey: ["createFile"],
    onSuccess: (data) => {
      queryClient.setQueryData(getFolderFiles(data.projectId).queryKey, (oldData) => {
        if (!oldData?.files)
          return {
            id: data.projectId,
            name: oldData?.name || "",
            description: oldData?.description || "",
            isFile: false,
            files: [data],
            updateTime: new Date().toISOString(),
          } satisfies Project;

        return {
          ...oldData,
          isFile: false,
          files: [...oldData.files, data],
          updateTime: new Date().toISOString(),
        } satisfies Project;
      });
      queryClient.invalidateQueries({
        queryKey: getFolders().queryKey,
      });
    },
    apiClientKey,
  });
};
export const createFileMutation = (queryClient: QueryClient) => {
  return createApiPostMutation<File, FileCreateRequest>(CONFIG.ENDPOINTS.FILES, {
    mutationKey: ["createFile"],
    onSuccess: (data) => {
      // file is at the top level of workspace
      queryClient.setQueryData(getFolders().queryKey, (oldData) => {
        if (!oldData)
          return [
            {
              id: data.projectId,
              name: data.name,
              description: data.description,
              isFile: true,
              files: [data],
              updateTime: new Date().toISOString(),
            } satisfies TopFile,
          ];

        const newData = produce(oldData, (draft) => {
          draft.unshift({
            id: data.projectId,
            name: data.name,
            description: data.description,
            isFile: true,
            files: [data],
            updateTime: new Date().toISOString(),
          });
        });

        return newData;
      });
      queryClient.invalidateQueries({
        queryKey: getFolders().queryKey,
      });
    },
    apiClientKey,
  });
};

export const updateFileInsideFolderMutation = (queryClient: QueryClient, fileId: string) => {
  return createApiPutMutation<undefined, FileUpdateRequest, ContextOptimisticUpdate<Project>>(CONFIG.ENDPOINTS.FILE(fileId), {
    mutationKey: ["updateFile", fileId],
    onMutate: async (variables) => {
      const queryKey = getFolderFiles(variables.projectId).queryKey;
      await queryClient.cancelQueries({ queryKey: queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      const newData = produce(previousData, (draft) => {
        const file = { ...variables, updateTime: new Date().toISOString() };
        if (!draft?.files) {
          draft = {
            id: variables.projectId,
            name: variables.name,
            description: variables.description,
            isFile: false,
            files: [file],
            updateTime: new Date().toISOString(),
          };
          return;
        }
        const index = draft.files.findIndex((file) => file.id === variables.id);
        if (index !== -1) {
          draft.files![index] = Object.assign(draft.files![index], file);
          draft.isFile = false;
        }
      });
      queryClient.setQueryData(queryKey, newData);
      return { previousData };
    },
    onError: (_, variables, context) => {
      if (context?.previousData) {
        const queryKey = getFolderFiles(variables.projectId).queryKey;
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: getFolders().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getFolderFiles(variables.projectId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getSubflowProject().queryKey,
      });
    },
    apiClientKey,
  });
};

export const updateFileMutation = (queryClient: QueryClient, fileId: string) => {
  return createApiPutMutation<undefined, FileUpdateRequest, ContextOptimisticUpdate<ProjectsResponse>>(CONFIG.ENDPOINTS.FILE(fileId), {
    mutationKey: ["updateFile", fileId],
    onMutate: async (variables) => {
      const queryKey = getFolders().queryKey;
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
        const queryKey = getFolders().queryKey;
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getFolders().queryKey,
      });
    },
    apiClientKey,
  });
};
export const deleteFileMutation = (queryClient: QueryClient, fileId: string, folderId: string) => {
  return createApiDeleteMutation(CONFIG.ENDPOINTS.FILE(fileId), {
    mutationKey: ["deleteFile", fileId],
    onMutate: async () => {
      const queryKey = getArchivedFolders().queryKey;
      const archivedFilesQueryKey = getArchivedFolderFiles(folderId).queryKey;

      await queryClient.cancelQueries({ queryKey: queryKey });
      await queryClient.cancelQueries({ queryKey: archivedFilesQueryKey });

      const previousData = queryClient.getQueryData(queryKey);
      const previousArchivedFiles = queryClient.getQueryData(archivedFilesQueryKey);

      const newData = produce(previousData, (draft) => {
        if (!draft) return;

        return draft.filter((project) => !project.isFile || project.files[0].id !== fileId);
      });
      const newArchivedFiles = produce(previousArchivedFiles, (draft) => {
        if (draft && draft.files) {
          draft.files = draft.files.filter((file) => file.id !== fileId);
        }
      });

      queryClient.setQueryData(queryKey, newData);
      queryClient.setQueryData(archivedFilesQueryKey, newArchivedFiles);

      return { previousData, previousArchivedFiles };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        const queryKey = getArchivedFolders().queryKey;
        queryClient.setQueryData(queryKey, context.previousData);
      }
      if (context?.previousArchivedFiles) {
        const archivedFilesQueryKey = getArchivedFolderFiles(folderId).queryKey;
        queryClient.setQueryData(archivedFilesQueryKey, context.previousArchivedFiles);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getArchivedFolders().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getArchivedFolderFiles(folderId).queryKey,
      });
    },
    apiClientKey,
  });
};

export const getFile = (fileId: string) =>
  createApiQuery<File>(CONFIG.ENDPOINTS.FILE(fileId), ["getFile", fileId], {
    apiClientKey,
  });

export const getFileSystemRulesByAgent = (fileId: string, agentKey: string) =>
  createApiQuery<systemRules[]>(CONFIG.ENDPOINTS.FILE_AGENT_SYSTEM_RULES(fileId, agentKey), ["getFileSystemRulesByAgent", fileId, agentKey], {
    apiClientKey,
  });

export type UpdateFileRulesDto = {
  systemRules: systemRules[] | null;
  rulesRouteConfig: RulesRouteConfig | null;
};

export const editFileSystemRules = (queryClient: QueryClient, fileId: string) => {
  return createApiPutMutation<void, UpdateFileRulesDto, ContextOptimisticUpdate<File>>(CONFIG.ENDPOINTS.FILE_SYSTEM_RULES(fileId), {
    mutationKey: ["editFileSystemRules", fileId],
    onMutate: async (variables: UpdateFileRulesDto) => {
      const queryKey = getFile(fileId).queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      if (previousData) {
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            systemRules: variables.systemRules || oldData.systemRules,
            rulesRouteConfig: variables.rulesRouteConfig || oldData.rulesRouteConfig,
          } as File;
        });
      }
      return { previousData };
    },
    onError: (_, __, context) => {
      const queryKey = getFile(fileId).queryKey;
      if (context?.previousData) queryClient.setQueryData(queryKey, context.previousData);
    },
    onSettled: (_, __) => {
      queryClient.invalidateQueries({ queryKey: getFile(fileId).queryKey });
      queryClient.invalidateQueries({ queryKey: getSubflowProject().queryKey });
    },
    apiClientKey,
  });
};

export const updateFileInsideCanvas = (queryClient: QueryClient, fileId: string) => {
  return createApiPutMutation(CONFIG.ENDPOINTS.FILE(fileId), {
    mutationKey: ["updateFileInsideCanvas", fileId],
    onMutate: async (variables: File) => {
      const queryKey = getFile(fileId).queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      if (previousData) {
        queryClient.setQueryData(queryKey, (oldData) => ({
          ...oldData,
          ...variables,
        }));
      }
      return { previousData };
    },
    onError: (_, __, context) => {
      const queryKey = getFile(fileId).queryKey;
      queryClient.setQueryData(queryKey, context?.previousData);
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({
        queryKey: getFolders().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getFile(fileId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getFolderFiles(variables.projectId).queryKey,
      });
    },
    apiClientKey,
  });
};

export const archiveFileMutation = (queryClient: QueryClient, fileId: string) => {
  return createApiPostMutation(CONFIG.ENDPOINTS.ARCHIVE_FILE(fileId), {
    mutationKey: ["archiveFile"],
    onMutate: async () => {
      const queryKey = getFolders().queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      // file is at the top level of workspace
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return [];
        return oldData.filter((folder) => !folder.isFile || folder.files[0].id !== fileId);
      });
      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getFolders().queryKey, () => context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getArchivedFolders().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getFolders().queryKey,
      });
    },
    apiClientKey,
  });
};

export const archiveFileInsideFolderMutation = (queryClient: QueryClient, projectId: string, fileId: string) => {
  return createApiPostMutation<void, void, ContextOptimisticUpdate<Project>>(CONFIG.ENDPOINTS.ARCHIVE_FILE(fileId), {
    mutationKey: ["archiveFile"],
    onMutate: async () => {
      // file is inside folder
      const queryKey = getFolderFiles(projectId).queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData || !oldData.files || !oldData.files.length) return oldData;

        return {
          ...oldData,
          files: oldData.files.filter((file) => file.id !== fileId),
        };
      });
      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getFolderFiles(projectId).queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getArchivedFolders().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getFolderFiles(projectId).queryKey,
      });
    },
    apiClientKey,
  });
};
export const duplicateFileMutation = (queryClient: QueryClient, fileId: string) => {
  return createApiPostMutation<File, { fileId: string; projectId: string }>(CONFIG.ENDPOINTS.DUPLICATE_FILE(fileId), {
    mutationKey: ["duplicateFile"],
    onSuccess: (data, variables) => {
      // Invalidate folders (top level) and specific project folder listing
      queryClient.invalidateQueries({ queryKey: getFolderFiles(variables.projectId).queryKey });
      // Prime cache for the new file details
      if (data?.id) {
        queryClient.setQueryData(getFile(data.id).queryKey, data);
      }
    },
    apiClientKey,
  });
};

export const duplicateTemplateMutation = (queryClient: QueryClient, fileId: string) => {
  return createApiPostMutation<File, { fileId: string; projectId: string }>(CONFIG.ENDPOINTS.DUPLICATE_FILE(fileId), {
    mutationKey: ["duplicateFile"],
    onSuccess: (data) => {
      // Prime cache for the new file details
      if (data?.id) {
        const queryKey = getSubflowProject().queryKey;
        const oldData = queryClient.getQueryData(queryKey);
        if (oldData) {
          const newData = produce(oldData[0].files, (draft) => {
            draft.unshift(data);
          });
          queryClient.setQueryData(queryKey, [{ ...oldData[0], files: newData }]);
        }
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getSubflows().queryKey });
      // Invalidate any infinite subflows pagination queries
      queryClient.invalidateQueries({ queryKey: ["subflows", "infinite"] });
    },
    apiClientKey,
  });
};
