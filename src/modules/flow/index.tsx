import React, { ReactNode, useCallback, useLayoutEffect, useRef } from "react";

import { useReactFlow } from "@xyflow/react";
import { useLocation, useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import {
  Canvas,
  NodesCatalog,
  UndoRedoControls,
  CustomFlowControls,
  UnsavedChangesGuard,
  JobSubscriber,
  CanvasDialogProvider,
  FlowHandlers,
  VersionFlowHandlers,
} from "./components";
import { CANVAS_VIEW_SETTINGS } from "@/constants";
import { useGetConfiguration } from "@/services";
import { FlowStoreState, useFlowStore } from "@/store";

import "@xyflow/react/dist/style.css";

const selector = (state: FlowStoreState) => ({
  selected: state.selected,
  setOrchestrationConfig: state.setOrchestrationConfig,
  setLastSaved: state.setLastSaved,
});

type Props = React.FC<{
  children?: ReactNode;
  fitViewOptions?: Partial<typeof CANVAS_VIEW_SETTINGS>;
  onLoadConfiguration?: () => void;
}>;

const Flow: Props = ({ children, fitViewOptions, onLoadConfiguration }) => {
  const { configId = "", subflowConfigId = ""} = useParams();
  const { setOrchestrationConfig, setLastSaved } = useFlowStore(useShallow(selector));
  const isInitialized = useFlowStore((state) => state.isInitialized);
  const once = useRef(false);
  const location = useLocation();
  const { data, isSuccess, isError } = useGetConfiguration(subflowConfigId || configId);
  const { fitView, setViewport } = useReactFlow();


  // This is a workaround to ensure that the fitView function is called after the nodes are rendered.
  const onFitView = useCallback(() => {
    setTimeout(() => {
      fitView({ ...CANVAS_VIEW_SETTINGS, ...fitViewOptions });
    }, 400);
  }, [fitView, fitViewOptions]);

  useLayoutEffect(() => {
    if (!isSuccess && !isError) return;
    if (isSuccess && !isInitialized) {
      setOrchestrationConfig(data.config);
      onLoadConfiguration?.();
      setTimeout(() => {
        setLastSaved(data.version.timestamp);
      }, 0);
    }
    if (!once.current) {
      onFitView();
      once.current = true;
    } else {
      if (location.state?.viewport) {
        setTimeout(() => {
          setViewport(location.state.viewport, { duration: 0 });
        }, 100);
      }
      if (location.state?.shouldFit) {
        onFitView();
      }
    }
  }, [
    data,
    isSuccess,
    isError,
    isInitialized,
    setOrchestrationConfig,
    setLastSaved,
    onFitView,
    location.state?.viewport,
    location.state?.shouldFit,
    setViewport,
    subflowConfigId,
    configId,
    onLoadConfiguration,
  ]);

  return <div>{children}</div>;
};

export default Flow;
export {
  Canvas,
  NodesCatalog,
  UndoRedoControls,
  CustomFlowControls,
  UnsavedChangesGuard,
  JobSubscriber,
  CanvasDialogProvider,
  FlowHandlers,
  VersionFlowHandlers,
};
export * from "./contexts";
