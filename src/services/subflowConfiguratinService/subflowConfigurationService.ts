import { useMutation, useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";

import {
  createSubflowConfiguration,
  createSubflowConfigurationVariables,
  createSubflowMutation,
  deleteSubflow,
  getSubflowConfiguration,
  getSubflowInputsOutputs,
  getSubflowProject,
  getSubflows,
  getSubflowsPage,
  updateSubflowMutation,
} from "./subflowConfigurationQueries";
import { useApiMutation, useApiQuery, useInfiniteApiQuery } from "@/api";
import { ConfigurationVersion, File } from "@/modules/workspace";

const parseConfiguration = (data: ConfigurationVersion): ConfigurationVersion & { config: any } => {
  console.log(data.frontendConfigurationSerialized)
  return {
    ...data,
    config: JSON.parse(data.frontendConfigurationSerialized || "{}")?.config || {},
  };
};

export function useCreateSubflowConfiguration(fileId: string) {
  const queryClient = useQueryClient();
  return useMutation(createSubflowConfiguration(fileId, queryClient));
}
export function useGetSubflowConfiguration(configId: string) {
  return useApiQuery(getSubflowConfiguration(configId), {
    enabled: !!configId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    select: parseConfiguration,
  });
}
export function useGetSubflowsProjectService() {
  return useApiQuery(getSubflowProject(), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
    placeholderData: [
      {
        id: "",
        name: "",
        description: "",
        updateTime: "",
        files: [],
        isSubflow: true,
        isFile: true,
      },
    ],
  });
}
export function useGetSubflowsService() {
  return useApiQuery(getSubflows(), {
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
}

export function useGetSubflowsPageQuery(pageSize: number = 10) {
  return useInfiniteApiQuery(getSubflowsPage(pageSize), {
    refetchOnMount: "always",
  });
}

export function useUpdateSubflowMutation(file: File) {
  const queryClient = useQueryClient();
  return useMutation(updateSubflowMutation(queryClient, file.id));
}

export function useCreateSubflowMutation() {
  const queryClient = useQueryClient();
  return useMutation(createSubflowMutation(queryClient));
}

export function useGetSubflowsInputsOutputs(subflowId: string) {
  return useApiQuery(getSubflowInputsOutputs(subflowId), {
    enabled: !!subflowId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    refetchOnMount: "always",
    refetchOnWindowFocus: "always",
  });
}

export function useCreateSubflowVariables() {
  const queryClient = useQueryClient();
  return useMutation(createSubflowConfigurationVariables(queryClient));
}

export const useDeleteSubflowMutation = (fileId: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useApiMutation(deleteSubflow(fileId, queryClient), {
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Subflow deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete subflow",
      });
    },
  });
};
