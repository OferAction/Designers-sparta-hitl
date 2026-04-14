import { useEffect } from "react";

import { useShallow } from "zustand/shallow";

import LastModified from "@/components/common/LastModified";
import { ViewOnlyProvider } from "@/contexts/ViewOnlyContext";
import CenterLayout from "@/layouts/CenterLayout";
import LeftPanelLayout from "@/layouts/LeftPanelLayout";
import RightPanelLayout from "@/layouts/RightPanelLayout";
import FlowComponent, { Canvas, CanvasDialogProvider, FlowHandlers } from "@/modules/flow";
import { PanelDialogProvider } from "@/modules/flow/components";
import FlowFooter from "@/modules/flow/components/FlowFooter";
import FlowHeader from "@/modules/flow/components/FlowHeader";
import FlowResizablePanelGroup from "@/modules/flow/components/FlowResizablePanelGroup";
import { CanvasLeftPanel } from "@/modules/flow/components/LeftPanel";
import VersionHistoryPanel from "@/modules/flow/components/VersionHistory/VHSideMenu";
import { useFlowStoreCleanup, useReadOnlyCanvasInteractions } from "@/modules/flow/hooks";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => ({
  leftPanelActiveItem: state.leftPanelActiveItem,
  setLeftPanelActiveItem: state.setLeftPanelActiveItem,
  setContextualMenuActiveAction: state.setContextualMenuActiveAction,
});

const FlowHistory = () => {
  const { setLeftPanelActiveItem, setContextualMenuActiveAction } = useFlowStore(useShallow(selector));

  useEffect(() => {
    setLeftPanelActiveItem("idle");
    setContextualMenuActiveAction("versionHistory");
  }, [setContextualMenuActiveAction, setLeftPanelActiveItem]);

  useFlowStoreCleanup();
  useReadOnlyCanvasInteractions();

  return (
    <ViewOnlyProvider>
      <CanvasDialogProvider>
        <PanelDialogProvider>
          <div className="absolute w-full">
            <FlowComponent>
              <Canvas>
                <FlowHandlers />
              </Canvas>
            </FlowComponent>
          </div>
          <FlowResizablePanelGroup direction="horizontal" className="!h-screen">
            <LeftPanelLayout>
              <CanvasLeftPanel />
            </LeftPanelLayout>
            <CenterLayout>
              <FlowHeader>
                <LastModified />
              </FlowHeader>
              <FlowFooter showExecutionPanelsProp={false} />
            </CenterLayout>
            <RightPanelLayout>
              <VersionHistoryPanel />
            </RightPanelLayout>
          </FlowResizablePanelGroup>
        </PanelDialogProvider>
      </CanvasDialogProvider>
    </ViewOnlyProvider>
  );
};

export default FlowHistory;
