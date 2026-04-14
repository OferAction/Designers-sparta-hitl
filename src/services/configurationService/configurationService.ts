import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";

import {
  createConfiguration,
  getConfiguration,
  getConfigurationHistory,
  getConfigurationByFileId,
  layoutConfiguration,
  restoreConfigurationHistory,
  updateConfiguration,
} from "./configurationQueries";
import {
  createSubflowConfiguration,
  createSubflowConfigurationVariables,
  getSubflowConfiguration,
  getSubflowConfigurationHistory,
  restoreSubflowConfigurationHistory,
  updateSubflowConfiguration,
} from "../subflowConfiguratinService";
import { useApiQuery } from "@/api";
import { useSubflowContext } from "@/modules/flow";
import { ConfigurationVersion } from "@/modules/workspace";

export function useGetConfigurationHistoryQuery(fileId: string, isSubflowFile?: boolean) {
  const [searchParams] = useSearchParams();

  return useApiQuery(isSubflowFile ? getSubflowConfigurationHistory(fileId, searchParams) : getConfigurationHistory(fileId, searchParams), {
    refetchOnMount: true,
    staleTime: 0,
    gcTime: 0,

    refetchOnWindowFocus: "always",
    placeholderData: [],
  });
}

export function useRestoreConfigurationHistory(configId: string, fileId: string) {
  const queryClient = useQueryClient();
  const isSubflowNode = useSubflowContext();
  const restoreConfiguration = isSubflowNode
    ? restoreSubflowConfigurationHistory(configId, fileId, queryClient)
    : restoreConfigurationHistory(configId, fileId, queryClient);
  return useMutation(restoreConfiguration);
}

export function useCreateConfiguration(fileId: string, projectId: string) {
  const queryClient = useQueryClient();
  const isSubflowNode = useSubflowContext();
  const createConfigFn = isSubflowNode ? createSubflowConfiguration(fileId, queryClient) : createConfiguration(fileId, projectId, queryClient);

  return useMutation(createConfigFn);
}

export function useCreateSubflowConfiguration() {
  const queryClient = useQueryClient();
  const createConfigFn = createSubflowConfigurationVariables(queryClient);
  return useMutation(createConfigFn);
}

export function useLayoutConfiguration() {
  return useMutation(layoutConfiguration());
}

export function useUpdateConfiguration(fileId: string, configId: string, projectId?: string, isSubflow?: boolean) {
  const queryClient = useQueryClient();
  // Check for context availability and provide a default false value
  const isSubflowContext = useSubflowContext();

  const isSubflowValue = isSubflow ?? isSubflowContext;
  // Explicitly determine which query function to use
  const queryFn = isSubflowValue
    ? updateSubflowConfiguration(fileId, configId, queryClient)
    : updateConfiguration(projectId || "", fileId, configId, queryClient);
  return useMutation(queryFn);
}

const parseConfiguration = (data: ConfigurationVersion): ConfigurationVersion & { config: any } => {
  try {
    const config = JSON.parse(data.frontendConfigurationSerialized || "{}")?.config || {};
    return {
      ...data,
      config,
    };
  } catch {
    return {
      ...data,
      config: {},
    };
  }
};
export function useGetConfiguration(configId: string) {
  // Check for context availability and provide a default false value
  const isSubflow = useSubflowContext();

  // Explicitly determine which query function to use
  const queryFn = isSubflow ? getSubflowConfiguration(configId) : getConfiguration(configId);

  return useApiQuery(queryFn, {
    enabled: !!configId,
    retry: 2,
    select: parseConfiguration,
    staleTime: 0,
    gcTime: 0,
  });
}

export function useGetConfigurationByFileId(fileId: string) {
  const queryFn = getConfigurationByFileId(fileId);

  return useApiQuery(queryFn, {
    enabled: !!fileId,
    retry: 2,
    select: parseConfiguration,
    staleTime: 0,
    gcTime: 0,
  });
}
