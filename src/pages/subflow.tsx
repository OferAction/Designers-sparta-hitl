import CenterLayout from "@/layouts/CenterLayout";
import LeftPanelLayout from "@/layouts/LeftPanelLayout";
import RightPanelLayout from "@/layouts/RightPanelLayout";
import FlowComponent, {
  Canvas,
  CanvasDialogProvider,
  CustomFlowControls,
  FlowHandlers,
  JobSubscriber,
  SubflowProvider,
  UnsavedChangesGuard,
} from "@/modules/flow";
import { PanelDialogProvider } from "@/modules/flow/components";
import FlowFooter from "@/modules/flow/components/FlowFooter";
import FlowHeader from "@/modules/flow/components/FlowHeader";
import FlowResizablePanelGroup from "@/modules/flow/components/FlowResizablePanelGroup";
import { SubflowLeftPanel } from "@/modules/flow/components/LeftPanel";
import { useEnableCanvasInteractions, useFlowStoreCleanup } from "@/modules/flow/hooks";
import GenOne from "@/modules/genOne/GenOne";

const Subflow = () => {
  useEnableCanvasInteractions();
  useFlowStoreCleanup();

  return (
    <>
      <SubflowProvider>
        <CanvasDialogProvider>
          <PanelDialogProvider>
            <div className="absolute w-full">
              <FlowComponent>
                <Canvas>
                  <FlowHandlers />
                  <UnsavedChangesGuard />
                  <JobSubscriber />
                </Canvas>
              </FlowComponent>
            </div>
            <FlowResizablePanelGroup direction="horizontal" className="!h-screen">
              <LeftPanelLayout>
                <SubflowLeftPanel />
              </LeftPanelLayout>
              <CenterLayout className="ring-2 ring-border-purple rounded-md m-1.5">
                <FlowHeader className="flex justify-between items-center">
                  <FlowFooter>
                    <GenOne />
                  </FlowFooter>
                  <CustomFlowControls />
                </FlowHeader>
              </CenterLayout>
              <RightPanelLayout />
            </FlowResizablePanelGroup>
          </PanelDialogProvider>
        </CanvasDialogProvider>
      </SubflowProvider>
    </>
  );
};

export default Subflow;
