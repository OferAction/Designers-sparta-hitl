import { QueryClient } from "@tanstack/react-query";
import { produce } from "immer";

import { getArchivedFolders } from "../archiveService";
import { createApiQuery, createApiPostMutation, createApiPutMutation, createApiDeleteMutation, createApiInfiniteQuery } from "@/api";
import API_CONFIGS from "@/config/api.config";
import { queryClient } from "@/lib/queryClient";
import type { ProjectsResponse, ProjectResponse, ProjectCreateRequest, Project, ProjectUpdateRequest } from "@/modules/workspace/types";

const apiClientKey = "DEFAULT";
const CONFIG = API_CONFIGS[apiClientKey];

export const getFolders = () =>
  createApiQuery<ProjectsResponse>(CONFIG.ENDPOINTS.PROJECTS, ["projects"], {
    apiClientKey,
  });

export const getFoldersPage = (pageSize: number, name?: string, sortDirection?: 0 | 1) =>
  createApiInfiniteQuery<ProjectsResponse>(
    `${CONFIG.ENDPOINTS.PROJECTS}`,
    ["projects", "infinite", pageSize.toString(), name || "", sortDirection?.toString() || ""],
    {
      apiClientKey,
      initialPageParam: 1,
      getNextPageParam: (lastPage, allPages) => {
        if (!lastPage || lastPage.length < pageSize) return undefined;
        return allPages.length + 1;
      },
    },
    {
      params: {
        pageSize,
        ...(name && { name }),
        ...(sortDirection !== undefined && { sortDirection }),
      },
    }
  );
export const getFolderFiles = (projectId: string) =>
  createApiQuery<Project>(CONFIG.ENDPOINTS.PROJECT(projectId), ["projects", projectId], {
    apiClientKey,
    initialData: () => {
      return queryClient.getQueryData(getFolders().queryKey)?.find((folder) => folder.isFile !== true && folder.id === projectId) as Project;
    },
  });

export const createFolder = (queryClient: QueryClient) => {
  return createApiPostMutation<Project, ProjectCreateRequest>(CONFIG.ENDPOINTS.PROJECTS, {
    mutationKey: ["createFolder"],
    onSuccess: (data) => {
      queryClient.setQueryData(getFolders().queryKey, (oldData) => {
        if (!oldData) return [data];
        const newData = [data, ...oldData];
        return newData;
      });
      queryClient.invalidateQueries({
        queryKey: getFolders().queryKey,
      });
    },
    apiClientKey,
  });
};

export const updateFolder = (queryClient: QueryClient, projectId: string) => {
  return createApiPutMutation<ProjectsResponse, ProjectUpdateRequest>(CONFIG.ENDPOINTS.PROJECT(projectId), {
    mutationKey: ["updateFolder", projectId],
    // This is an optimistic update that may cause the folder name to be updated and then revert back
    // if the folder couldn't be updated, in case of an error
    onMutate: async (variables) => {
      const queryKey = getFolders().queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      if (previousData) {
        queryClient.setQueryData(queryKey, (oldData) => {
          if (!oldData) return [variables];
          const newData = oldData.map((folder) => (folder.id === variables.id ? ({ ...folder, ...variables } as ProjectResponse) : folder));
          return newData;
        });
      }
      return { previousData };
    },
    onError: (_, __, context) => {
      const queryKey = getFolders().queryKey;
      queryClient.setQueryData(queryKey, context?.previousData);
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: getFolders().queryKey,
      }),
    apiClientKey,
  });
};
export const deleteFolder = (queryClient: QueryClient, projectId: string) => {
  return createApiDeleteMutation(CONFIG.ENDPOINTS.PROJECT(projectId), {
    mutationKey: ["deleteFolder", projectId],
    onMutate: async () => {
      const queryKey = getArchivedFolders().queryKey;
      await queryClient.cancelQueries({ queryKey: queryKey });
      const previousData = queryClient.getQueryData(queryKey);

      const newData = produce(previousData, (draft) => {
        if (!draft) return;

        return draft.filter((project) => project.id !== projectId);
      });
      queryClient.setQueryData(queryKey, newData);

      return { previousData };
    },
    onError: (_, __, context) => {
      const queryKey = getArchivedFolders().queryKey;
      if (context?.previousData) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: getArchivedFolders().queryKey,
      }),
    apiClientKey,
  });
};

export const archiveFolder = (queryClient: QueryClient, folderId: string) => {
  return createApiPostMutation(CONFIG.ENDPOINTS.ARCHIVE_PROJECT(folderId), {
    mutationKey: ["archiveFolder"],
    onMutate: async () => {
      const queryKey = getFolders().queryKey;
      await queryClient.cancelQueries({ queryKey });
      const previousData = queryClient.getQueryData(queryKey);
      if (previousData) {
        queryClient.setQueryData(queryKey, (oldData) => {
          return oldData?.filter((folder) => folder.id !== folderId) ?? [];
        });
      }
      return { previousData };
    },
    onError: (_, __, context) => {
      if (context?.previousData) {
        queryClient.setQueryData(getFolders().queryKey, context.previousData);
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
export const duplicateProjectMutation = (queryClient: QueryClient, projectId: string) => {
  return createApiPostMutation<ProjectResponse>(CONFIG.ENDPOINTS.DUPLICATE_PROJECT(projectId), {
    mutationKey: ["duplicateProject"],
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: getFolders().queryKey });
      queryClient.invalidateQueries({ queryKey: getFolderFiles(projectId).queryKey });

      if (data?.id && data?.isFile === false) {
        queryClient.setQueryData(getFolderFiles(data.id).queryKey, data);
      } else {
        queryClient.setQueryData(getFolders().queryKey, (oldData) => {
          if (!oldData) return [data];
          const newData = [data, ...oldData];
          return newData;
        });
      }
    },
    apiClientKey,
  });
};
