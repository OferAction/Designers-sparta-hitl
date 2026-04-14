import { useEffect } from "react";

import { useParams } from "react-router-dom";

import { useFlowStore } from "@/store";

/**
 * Hook to clean up flow store state when component unmounts
 * Resets the isInitialized flag to ensure proper initialization on next mount
 */
export const useFlowStoreCleanup = () => {
  const { configId = "", subflowConfigId = "" } = useParams();

  useEffect(() => {
    return () => {
      useFlowStore.setState({
        isInitialized: false,
        nodes: [],
        edges: [],
        jobId: "",
        loading: false,
      });
    };
  }, [configId, subflowConfigId]);
};
export const useFlowStoreCleanupByFileId = () => {
  const { fileId = "" } = useParams();

  useEffect(() => {
    return () => {
      useFlowStore.setState({
        isInitialized: false,
        nodes: [],
        edges: [],
        jobId: "",
        loading: false,
      });
    };
  }, [fileId]);
};
