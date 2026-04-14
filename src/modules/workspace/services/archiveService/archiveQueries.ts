import { QueryClient } from "@tanstack/react-query";

import { createApiPostMutation, createApiQuery } from "@/api";
import API_CONFIGS from "@/config/api.config";
import type { Project, ProjectsResponse } from "@/modules/workspace/types";

const apiClientKey = "DEFAULT";
const CONFIG = API_CONFIGS[apiClientKey];

export const getArchivedFolders = () =>
  createApiQuery<ProjectsResponse>(CONFIG.ENDPOINTS.ARCHIVE, ["archive", "projects"], {
    apiClientKey,
  });

export const getArchivedFolderFiles = (projectId: string) =>
  createApiQuery<Project>(CONFIG.ENDPOINTS.ARCHIVED_PROJECT(projectId), ["archive", "projects", projectId], {
    apiClientKey,
  });

export const restoreArchivedFolder = (queryClient: QueryClient, projectId: string) => {
  return createApiPostMutation(CONFIG.ENDPOINTS.RESTORE_PROJECT(projectId), {
    mutationKey: ["restoreFolder", projectId],
    onMutate: async () => {
      const queryKey = getArchivedFolders().queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      if (previousData) {
        queryClient.setQueryData(queryKey, (oldData) => {
          return oldData?.filter((item) => item.id !== projectId);
        });
      }
      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getArchivedFolders().queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getArchivedFolders().queryKey,
      });
    },
    apiClientKey,
  });
};

export const restoreArchivedFile = (queryClient: QueryClient, projectId: string, fileId: string) => {
  return createApiPostMutation(CONFIG.ENDPOINTS.RESTORE_FILE(fileId), {
    mutationKey: ["restoreFile", fileId],
    onMutate: async () => {
      const queryKey = getArchivedFolders().queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      if (previousData) {
        queryClient.setQueryData(queryKey, (oldData) => {
          return oldData?.filter((item) => item.id !== projectId);
        });
      }
      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getArchivedFolders().queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getArchivedFolders().queryKey,
      });
    },
    apiClientKey,
  });
};

export const restoreArchivedFileFromFolder = (queryClient: QueryClient, projectId: string, fileId: string) => {
  return createApiPostMutation(CONFIG.ENDPOINTS.RESTORE_FILE(fileId), {
    mutationKey: ["restoreFile", fileId],
    onMutate: async () => {
      const queryKey = getArchivedFolderFiles(projectId).queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      if (previousData) {
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            files: oldData?.files?.filter((item) => item.id !== fileId) ?? [],
          };
        });
      }
      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getArchivedFolderFiles(projectId).queryKey, context.previousData);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: getArchivedFolderFiles(projectId).queryKey,
      });
    },
    apiClientKey,
  });
};
