import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { useToast } from "@/hooks/use-toast";

import {
  getDatasets,
  getDatasetInfo,
  postDatasetMapping,
  getConfigurationDatasetMapping,
  getConfigurationDatasetMappingById,
  getDatasetVersion,
  getDatasetSample,
  getFileDatasets,
  getSubsetsByDatasetId,
  getPreprocessingFunctions,
} from "./datasetQueries";
import { createDataset, updateDataset } from "./datasetQueries";
import { transformDatasetInfoToTreeData, transformDatasetMappingResponse } from "./utils";
import { useApiQuery, useApiMutation } from "@/api";
import { TreeItem } from "@/components/ui/tree-view";
import { ToastActionDatasetFailed, ToastActionDatasetLoadedNotAutoConnected } from "@/modules/flow/components";
import { DatasetResponse } from "@/modules/flow/types";
import { useUploadFile } from "@/services";
import { useFlowStore } from "@/store";
import useDatasetUploadStore from "@/store/datasetUploadStore";
import { genId } from "@/utils";

interface DatasetUploadParams {
  datasetName: string;
  jsonlFile: File;
  zipFile: File;
}

interface UploadStep<TParams, TResult> {
  name: string;
  execute: (params: TParams) => Promise<TResult>;
  errorMessage: (params: TParams) => string;
  shouldRetry?: boolean;
}

interface UploadContext {
  jsonlUrls: string | null;
  dataset: DatasetResponse | null;
  zipUrls: string | null;
}

export function useGetConfigurationDatasetMappingById(fileId: string, datasetTreeData?: TreeItem[], rawFilesData?: TreeItem[]) {
  return useApiQuery(getConfigurationDatasetMappingById(fileId), {
    enabled: !!fileId,
    refetchOnMount: "always",
    staleTime: 1000,
    select: (data) => transformDatasetMappingResponse(data, datasetTreeData, rawFilesData),
  });
}

export function useGetDatasets(fileId?: string) {
  return useApiQuery(getDatasets(fileId), {
    refetchOnMount: "always",
    placeholderData: [],
  });
}

export function useGetFileDatasets(fileId: string) {
  return useApiQuery(getFileDatasets(fileId), {
    refetchOnMount: "always",
    placeholderData: [],
    enabled: !!fileId,
  });
}

export function useGetDatasetInfo(datasetId: string) {
  return useApiQuery(getDatasetInfo(datasetId), {
    enabled: !!datasetId,
    // Avoid re-fetching on every component (re)mount such as expanding/collapsing tree rows.
    // Data will be considered fresh for 5 minutes; adjust as needed.
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000,
    select: transformDatasetInfoToTreeData,
  });
}

export function useGetSubsetsByDatasetId(datasetId: string) {
  return useApiQuery(getSubsetsByDatasetId(datasetId), {
    refetchOnMount: "always",
    placeholderData: [],
    enabled: !!datasetId,
  });
}

export function usePostDatasetMapping(fileId: string) {
  const queryClient = useQueryClient();
  return useApiMutation(postDatasetMapping(fileId, queryClient));
}

export function useGetConfigurationDatasetMapping(configurationId: string, datasetVersionId: string) {
  return useApiQuery(getConfigurationDatasetMapping(configurationId, datasetVersionId), {
    enabled: !!configurationId && !!datasetVersionId,
    refetchOnMount: "always",
  });
}

export function useGetDatasetVersion(datasetVersionId: string) {
  return useApiQuery(getDatasetVersion(datasetVersionId), {
    enabled: !!datasetVersionId,
    refetchOnMount: "always",
  });
}

export function useGetDatasetSample(mappingId: string, index: number, subsetId: string, options = {}) {
  return useApiQuery(getDatasetSample(mappingId, index, subsetId), {
    enabled: !!mappingId && !!index && !!subsetId,
    refetchOnMount: "always",
    ...options,
  });
}

export function useGetPreprocessingFunctions(dataType: number, enabled: boolean = true) {
  return useApiQuery(getPreprocessingFunctions(dataType), {
    enabled: enabled && !!dataType,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
}

export const useDatasetUpload = (autoConnect: boolean) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const jsonlUpload = useUploadFile({
    mutationKey: ["jsonlUpload"],
    onSuccess: (fileNames) => {
      console.log("JSONL upload successful:", fileNames);
      toast({
        title: "JSONL upload successful",
        description: `JSONL file ${fileNames[0]} uploaded successfully`,
        position: "center",
      });
    },
  });

  const createDatasetMutation = useApiMutation(createDataset(queryClient), {
    onSuccess: (ds) => {
      if (autoConnect) {
        toast({
          title: "Dataset connected",
          description: "Upload complete — your dataset is now linked to the workflow.",
          position: "center",
        });
      } else {
        toast({
          title: "Dataset loaded",
          description: "Upload complete — your dataset is now loaded to the workflow.",
          position: "center",
          action: <ToastActionDatasetLoadedNotAutoConnected datasetId={ds.activeVersionId} />,
          className: "flex flex-col items-start",
        });
      }
    },
    retry: 5,
  });

  const zipUpload = useUploadFile({
    mutationKey: ["zipUpload"],
    onSuccess: (fileNames) => {
      console.log("ZIP upload successful:", fileNames);
      toast({
        title: "ZIP upload successful",
        description: `ZIP file ${fileNames[0]} uploaded successfully`,
        position: "center",
      });
    },
  });

  const updateDatasetMutation = useApiMutation(updateDataset(queryClient), {
    onError: () => {
      toast({
        title: "Dataset failed to load",
        description: "An error occurred while uploading the dataset",
        position: "center",
        className: "bg-border-destructive border border-destructive",
      });
    },
    retry: 5,
  });

  const showRetryToast = useCallback(
    (title: string, description: string): Promise<boolean> => {
      return new Promise((resolve) => {
        toast({
          title,
          description,
          position: "center",
          className: "bg-border-destructive border border-destructive flex flex-col items-start",
          onOpenChange: (open) => {
            if (!open) {
              resolve(false);
            }
          },
          action: <ToastActionDatasetFailed onRetry={() => resolve(true)} onUploadNew={() => resolve(false)} />,
        });
      });
    },
    [toast]
  );

  const executeWithRetry = useCallback(
    async <TParams, TResult>(step: UploadStep<TParams, TResult>, params: TParams, id: string) => {
      while (true) {
        try {
          useDatasetUploadStore.getState().updateUpload(id, "uploading");
          const result = await step.execute(params);
          return result;
        } catch (error) {
          console.error(`${step.name} failed:`, error);

          if (!step.shouldRetry) {
            useDatasetUploadStore.getState().updateUpload(id, "error", { error: step.errorMessage(params) });
            throw error;
          }

          const externalRetryPromise = new Promise<boolean>((resolve) => {
            useDatasetUploadStore.getState().updateUpload(id, "error", { error: step.errorMessage(params), onRetry: () => resolve(true) });
          });

          const shouldRetryAgainToast = showRetryToast("Dataset failed to load", step.errorMessage(params));

          // if one of them resolves to true, I can resolve to true immediately
          // if one of them resolves to false, I need to wait for the other one
          // if the other one resolves to true, I can resolve to true
          // if the other one resolves to false, I can resolve to false
          const shouldRetryAgain = await new Promise<boolean>((resolve) => {
            let resolved = false;
            let prevValue = false;

            externalRetryPromise.then((value) => {
              if (resolved && !prevValue && !value) {
                resolve(false);
              }
              if (!resolved && value) {
                resolved = true;
                resolve(value);
              }
              prevValue = value;
            });

            shouldRetryAgainToast.then((value) => {
              if (resolved && !prevValue && !value) {
                resolve(false);
              }
              if (!resolved && value) {
                resolved = true;
                resolve(value);
              }
              prevValue = value;
            });
          });

          if (!shouldRetryAgain) {
            throw error;
          }
        }
      }
    },
    [showRetryToast]
  );

  const uploadDataset = useCallback(
    async (params: DatasetUploadParams) => {
      const id = genId();
      useDatasetUploadStore.getState().addUpload({
        id,
        name: params.datasetName,
        autoConnect,
      });
      const context: UploadContext = {
        jsonlUrls: null,
        dataset: null,
        zipUrls: null,
      };

      try {
        const uploadSteps = [
          {
            name: "JSONL Upload",
            execute: () => jsonlUpload.mutateAsync({ files: [params.jsonlFile] }),
            errorMessage: () => `${params.jsonlFile.name} did not load due to an error`,
            shouldRetry: true,
          },
          {
            name: "Dataset Creation",
            execute: () =>
              createDatasetMutation.mutateAsync({
                name: params.datasetName,
                datasetVersion: { jsonUrl: context.jsonlUrls! },
              }),
            errorMessage: () => `Dataset ${params.datasetName} creation failed due to an error`,
            shouldRetry: true,
          },
          {
            name: "ZIP Upload",
            execute: () => zipUpload.mutateAsync({ files: [params.zipFile] }),
            errorMessage: () => `${params.zipFile.name} did not load due to an error`,
            shouldRetry: true,
          },
          {
            name: "Dataset Update",
            execute: () =>
              updateDatasetMutation.mutateAsync({
                $datasetVersionId: context.dataset!.activeVersionId,
                zipUrl: context.zipUrls!,
              }),
            errorMessage: () => `${params.zipFile.name} did not load due to an error`,
            shouldRetry: true,
          },
        ] as const;

        const jsonlUrls = await executeWithRetry(uploadSteps[0], params, id);
        context.jsonlUrls = jsonlUrls[0];

        const dataset = await executeWithRetry(uploadSteps[1], params, id);
        context.dataset = { ...dataset, createdTime: new Date().toISOString() };

        if (autoConnect) {
          useFlowStore.getState().connectDataset(context.dataset.activeVersionId);
        }

        const zipUrls = await executeWithRetry(uploadSteps[2], params, id);
        context.zipUrls = zipUrls[0];

        await executeWithRetry(uploadSteps[3], params, id);

        useDatasetUploadStore.getState().updateUpload(id, "completed", { dataset: context.dataset });
      } catch (error) {
        console.error(`Dataset upload failed:`, error);
      }
    },
    [autoConnect, createDatasetMutation, executeWithRetry, jsonlUpload, updateDatasetMutation, zipUpload]
  );

  return {
    isUploading: jsonlUpload.isPending || zipUpload.isPending,
    uploadDataset,
  };
};
