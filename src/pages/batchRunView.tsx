import { useCallback, useMemo } from "react";

import { FitViewOptions } from "@xyflow/react";
import { useParams } from "react-router-dom";

import FlowResizablePanelGroup from "../modules/flow/components/FlowResizablePanelGroup";
import CenterLayout from "@/layouts/CenterLayout";
import RightPanelLayout from "@/layouts/RightPanelLayout";
import { BatchRunHeader } from "@/modules/bna";
import FlowComponent, { Canvas, CanvasDialogProvider, VersionFlowHandlers } from "@/modules/flow";
import { PanelDialogProvider } from "@/modules/flow/components";
import FlowFooter from "@/modules/flow/components/FlowFooter";
import FlowHeader from "@/modules/flow/components/FlowHeader";
import { SubsetProvider } from "@/modules/flow/contexts/SubsetContext";
import { useFlowStoreCleanup, useCanvasPermissions } from "@/modules/flow/hooks";
import { useFlowStore } from "@/store";
import { CanvasInteractionPermissions } from "@/store/slices";

const permissions: Partial<CanvasInteractionPermissions> = {
  canChangeNodeData: false,
  canCreateElements: false,
  canDragOrRemoveNodes: false,
  canRemoveEdges: false,
  canRunFlow: false,
};

const useFlowProps = () => {
  const { propertyPath = "" } = useParams();

  const fitViewOptions = useMemo((): Partial<FitViewOptions> => {
    const nodeId = propertyPath ? propertyPath.split("-")[0] : null;
    if (nodeId) {
      return {
        maxZoom: 2,
        padding: {
          left: "0px",
          right: "50%",
          bottom: "50%",
        },
        nodes: [
          {
            id: nodeId,
          },
        ],
      };
    }
    return {};
  }, [propertyPath]);

  const onLoadConfiguration = useCallback(() => {
    const nodeId = propertyPath ? propertyPath.split("-")[0] : null;
    if (nodeId) {
      const { onNodesChange } = useFlowStore.getState();
      onNodesChange([
        {
          type: "select",
          id: nodeId || "",
          selected: true,
        },
      ]);
    }
  }, [propertyPath]);
  return { fitViewOptions, onLoadConfiguration };
};

const BatchRunView = () => {
  const { fitViewOptions, onLoadConfiguration } = useFlowProps();

  useFlowStoreCleanup();

  useCanvasPermissions(permissions);

  return (
    <SubsetProvider>
      <CanvasDialogProvider>
        <PanelDialogProvider>
          <div className="absolute w-full">
            <FlowComponent fitViewOptions={fitViewOptions} onLoadConfiguration={onLoadConfiguration}>
              <Canvas>
                <VersionFlowHandlers />
              </Canvas>
            </FlowComponent>
          </div>
          <FlowResizablePanelGroup direction="horizontal" className="!h-screen">
            <CenterLayout>
              <FlowHeader>
                <BatchRunHeader />
              </FlowHeader>
              <FlowFooter />
            </CenterLayout>
            <RightPanelLayout />
          </FlowResizablePanelGroup>
        </PanelDialogProvider>
      </CanvasDialogProvider>
    </SubsetProvider>
  );
};

export default BatchRunView;
