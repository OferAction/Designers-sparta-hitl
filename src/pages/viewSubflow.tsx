import { useCallback, useMemo } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import CenterLayout from "@/layouts/CenterLayout";
import LeftPanelLayout from "@/layouts/LeftPanelLayout";
import RightPanelLayout from "@/layouts/RightPanelLayout";
import FlowComponent, {
  Canvas,
  CanvasDialogProvider,
  FlowHandlers,
  JobSubscriber,
  SubflowProvider,
  UnsavedChangesGuard,
  ViewSubflowProvider,
} from "@/modules/flow";
import { PanelDialogProvider } from "@/modules/flow/components";
import FlowFooter from "@/modules/flow/components/FlowFooter";
import FlowHeader from "@/modules/flow/components/FlowHeader";
import FlowResizablePanelGroup from "@/modules/flow/components/FlowResizablePanelGroup";
import { SubflowLeftPanel } from "@/modules/flow/components/LeftPanel";
import { useEnableCanvasInteractions, useFlowStoreCleanup } from "@/modules/flow/hooks";
import { useGetFileQuery } from "@/services";
import { useGetSubflowConfiguration } from "@/services/subflowConfiguratinService";
import { FlowStoreState, useFlowStore } from "@/store";
import { FlowSidePanelState } from "@/store/slices";

import Shortcut, { type ShortcutDefinition } from "@/utils/Shortcut";

import { LEFT_PANEL_SHORTCUTS } from "@/constants/KeyboardShortcuts";

const selector = (state: FlowStoreState) => ({
  leftPanelActiveItem: state.leftPanelActiveItem,
  setLeftPanelActiveItem: state.setLeftPanelActiveItem,
  setJobId: state.setJobId,
});

const ViewSubflow = () => {
  const { leftPanelActiveItem, setLeftPanelActiveItem, setJobId } = useFlowStore(useShallow(selector));
  const { fileId = "", folderId = "", configId = "", subflowConfigId = "" } = useParams();
  const { data: subflowConfig } = useGetSubflowConfiguration(subflowConfigId);
  const { data: flowData } = useGetFileQuery(fileId || "");
  const { data: subflowData } = useGetFileQuery(subflowConfig?.fileId || "");

  const handleAction = useCallback(
    (panelActiveItem: FlowSidePanelState["leftPanelActiveItem"]) => {
      if (!panelActiveItem) return;
      if (panelActiveItem === leftPanelActiveItem) {
        setLeftPanelActiveItem(null);
      } else {
        setLeftPanelActiveItem(panelActiveItem);
      }
    },
    [leftPanelActiveItem, setLeftPanelActiveItem]
  );
  const navigate = useNavigate();

  const routeToMainCanvas = useCallback(() => {
    setJobId("");
    const path = `/canvas/${folderId}/${fileId}/${configId}`;
    navigate(path, { replace: true });
  }, [configId, fileId, folderId, navigate, setJobId]);

  const shortcuts = useMemo<ShortcutDefinition[]>(
    () =>
      LEFT_PANEL_SHORTCUTS.slice(0, 3).map(({ shortcut, action }) => ({
        id: `view-subflow-${action}`,
        keys: shortcut,
        handler: () => handleAction(action),
        options: { preventDefault: true },
      })),
    [handleAction]
  );
  useEnableCanvasInteractions();
  useFlowStoreCleanup();

  return (
    <>
      <Shortcut shortcuts={shortcuts} />
      {/* <CollaborativeContextProvider roomName={`${subflowConfigId}`}> */}
      <SubflowProvider>
        <ViewSubflowProvider>
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
                  <FlowHeader>
                    <div className="p-1 flex gap-2 pointer-events-auto items-center rounded-t w-full min-h-10">
                      <Breadcrumb className="p-2.5 bg-purple-accent/20 w-full">
                        <BreadcrumbList>
                          <BreadcrumbItem>
                            <BreadcrumbLink className="cursor-pointer" asChild>
                              <button className="cursor-pointer" onClick={routeToMainCanvas}>
                                {flowData?.name}
                              </button>
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                          <BreadcrumbSeparator />

                          <BreadcrumbItem>
                            <BreadcrumbLink className="text-foreground" asChild>
                              <span>{subflowData?.name}</span>
                            </BreadcrumbLink>
                          </BreadcrumbItem>
                        </BreadcrumbList>
                      </Breadcrumb>
                    </div>
                  </FlowHeader>
                  <FlowFooter />
                </CenterLayout>
                <RightPanelLayout />
              </FlowResizablePanelGroup>
            </PanelDialogProvider>
          </CanvasDialogProvider>
        </ViewSubflowProvider>
      </SubflowProvider>
      {/* </CollaborativeContextProvider> */}
    </>
  );
};

export default ViewSubflow;
