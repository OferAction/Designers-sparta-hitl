import { useCallback } from "react";

import { useQueryClient } from "@tanstack/react-query";
import { useReactFlow, useStoreApi } from "@xyflow/react";
import { useNavigate, useParams } from "react-router-dom";

import { useSubflowContext, useViewSubflowContext } from "../contexts";
import { getConfiguration, getFile, useUpdateConfiguration } from "@/services";
import { getSubflowConfiguration, useGetSubflowConfiguration } from "@/services/subflowConfiguratinService";
import { FlowStoreState, useFlowStore } from "@/store";

type OnSuccessCallback = NonNullable<NonNullable<Parameters<ReturnType<typeof useUpdateConfiguration>["mutate"]>[1]>["onSuccess"]>;
type OnSuccessParams = Parameters<OnSuccessCallback>;

const useHandleLiveBranch = () => {
  const queryClient = useQueryClient();
  const { configId = "", subflowConfigId = "", fileId = "" } = useParams();

  return useCallback(async (): Promise<OnSuccessParams | undefined> => {
    const file = await queryClient.ensureQueryData(getFile(fileId));
    if (file.status !== "Live" || file.parentFileId) return;

    if (!subflowConfigId && !configId) return;

    const configToRun = await queryClient.ensureQueryData(subflowConfigId ? getSubflowConfiguration(subflowConfigId) : getConfiguration(configId));
    return [
      {
        fileId: configToRun.fileId,
        id: configToRun.id,
        version: configToRun.version,
      },
      {
        fileId: configToRun.fileId,
        frontendConfigurationSerialized: configToRun.frontendConfigurationSerialized,
      },
      undefined,
      {
        client: queryClient,
        meta: {},
      },
    ];
  }, [fileId, configId, subflowConfigId, queryClient]);
};

const saveSelector = (state: FlowStoreState) => ({
  getCurrentConfig: state.getCurrentConfig,
  setLastSaved: state.setLastSaved,
  setJobId: state.setJobId,
});

export type UseSaveOrchestrationOptions = {
  isViewOnly?: boolean;
  isSubflowNode?: boolean;
};

export const useSaveOrchestration = ({ isViewOnly: isViewOnlyProps, isSubflowNode: isSubflowNodeProps }: UseSaveOrchestrationOptions = {}) => {
  const { getViewport } = useReactFlow();
  const flowStoreInstance = useStoreApi();
  const isViewOnlyContext = useViewSubflowContext();
  const isSubflowNodeContext = useSubflowContext();
  const isViewOnly = isViewOnlyProps ?? isViewOnlyContext;
  const isSubflowNode = isSubflowNodeProps ?? isSubflowNodeContext;
  const navigate = useNavigate();

  const { getCurrentConfig, setLastSaved, setJobId } = useFlowStore(saveSelector);
  const routerPath = "canvas";
  const routerSuffix = isSubflowNode ? "/subflow" : "";
  const { configId, fileId, folderId, subflowConfigId } = useParams();
  const newConfigId = subflowConfigId || configId || "";
  // Fetch subflow configuration when editing a subflow; then derive the correct fileId
  const { data: subflowConfig } = useGetSubflowConfiguration(subflowConfigId || "");
  const updatedFileId = subflowConfigId ? subflowConfig?.fileId || "" : fileId || "";

  const { mutate: updateConfiguration, isPending } = useUpdateConfiguration(updatedFileId || "", newConfigId, folderId || "", isSubflowNode);

  const handleLiveBranch = useHandleLiveBranch();

  const onSaveOrchestration = useCallback(
    async (options?: Parameters<typeof updateConfiguration>[1] & { shouldNavigate?: boolean }) => {
      try {
        if (!updatedFileId) return;
        flowStoreInstance.getState().resetSelectedElements();
        const config = getCurrentConfig();
        const stringifiedConfig = JSON.stringify(config);
        const { onSuccess, shouldNavigate = true, ...rest } = options || {};

        const liveBranchData = await handleLiveBranch();
        if (liveBranchData) {
          onSuccess?.(...liveBranchData);
          return;
        }

        updateConfiguration(
          {
            frontendConfigurationSerialized: stringifiedConfig,
            fileId: updatedFileId,
          },
          {
            onSuccess: (data, ...args) => {
              setLastSaved(data.version.timestamp);
              if (shouldNavigate && !isViewOnly) {
                const viewport = getViewport();
                navigate(`/${routerPath}/${folderId}/${fileId}/${data.id}${routerSuffix}`, { replace: true, state: { viewport } });
              }
              if (isViewOnly && subflowConfigId) {
                // We're editing a subflow in view-only mode:
                // 1) Pull parent config saved before entering subflow
                // 2) Update the subflow node's subflowConfigId to the new id
                // 3) Save updated parent config back so Flow can hydrate it on return
                try {
                  if (fileId) {
                    const oldData = JSON.parse(localStorage.getItem(fileId) || "[]");
                    localStorage.setItem(fileId, JSON.stringify([...oldData, { oldSubflowConfigId: subflowConfigId, newSubflowConfigId: data.id }]));
                  }
                } catch {
                  // ignore storage/parsing errors
                }
                if (!shouldNavigate) {
                  setJobId("");
                  navigate(`/canvas/${folderId}/${fileId}/${configId}`, { replace: true });
                } else {
                  const viewport = getViewport();
                  navigate(`/canvas/${folderId}/${fileId}/${configId}/subflow/${data.id}`, { replace: true, state: { viewport } });
                }
              }
              onSuccess?.(data, ...args);
            },
            ...rest,
          }
        );
      } catch (e) {
        console.error("Failed to save:", e);
        return;
      }
    },
    [
      updatedFileId,
      flowStoreInstance,
      getCurrentConfig,
      handleLiveBranch,
      updateConfiguration,
      setLastSaved,
      isViewOnly,
      subflowConfigId,
      getViewport,
      navigate,
      folderId,
      fileId,
      routerSuffix,
      setJobId,
      configId,
    ]
  );

  return {
    onSaveOrchestration,
    isPending,
  };
};
