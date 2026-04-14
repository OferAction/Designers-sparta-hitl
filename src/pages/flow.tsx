import { useEffect } from "react";

import { Node } from "@xyflow/react";
import { HotkeysProvider } from "react-hotkeys-hook";
import { useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { ShortcutsPanel } from "@/components/common/ShortcutsPanel";
import CenterLayout from "@/layouts/CenterLayout";
import LeftPanelLayout from "@/layouts/LeftPanelLayout";
import RightPanelLayout from "@/layouts/RightPanelLayout";
import { EditBNAHandler } from "@/modules/bna";
import { Canvas, CanvasDialogProvider, CustomFlowControls, JobSubscriber } from "@/modules/flow";
import { PanelDialogProvider, RealtimeFlowHandlers, PermissionsHandler } from "@/modules/flow/components";
import FlowFooter from "@/modules/flow/components/FlowFooter";
import FlowHeader from "@/modules/flow/components/FlowHeader";
import FlowResizablePanelGroup from "@/modules/flow/components/FlowResizablePanelGroup";
import FlowStatus from "@/modules/flow/components/FlowStatus";
import { CanvasLeftPanel } from "@/modules/flow/components/LeftPanel";
// import MoveToolsAndSearch from "@/modules/flow/components/MoveToolsAndSearch";
import CollaborativeContextProvider from "@/modules/flow/contexts/CollaborativeContext";
import { useFlowStoreCleanupByFileId, useFlowThumbnailUpdate } from "@/modules/flow/hooks";
import { GenOne } from "@/modules/genOne";
import { FlowStoreState, useFlowStore } from "@/store";

const SubflowNodesUpdater = () => {
  const { fileId } = useParams();
  const nodes = useFlowStore((state) => state.nodes);
  const onChange = useFlowStore((state) => state.onChange);

  useEffect(() => {
    if (!fileId) return;
    const subflowIdChanges = localStorage.getItem(fileId);
    if (nodes.length === 0) return;
    const changes = JSON.parse(subflowIdChanges || "[]") as { oldSubflowConfigId: string; newSubflowConfigId: string }[];

    changes.forEach((change) => {
      useFlowStore.getState().nodes.forEach((n: Node) => {
        if (n?.type === "subflow" && n?.data?.subflowConfigId === change.oldSubflowConfigId) {
          onChange(n.id, "subflowConfigId", change.newSubflowConfigId);
          localStorage.removeItem(fileId);
        }
      });
    });
  }, [fileId, nodes, onChange]);

  return null;
};

const selector = (state: FlowStoreState) => ({
  leftPanelActiveItem: state.leftPanelActiveItem,
  setLeftPanelActiveItem: state.setLeftPanelActiveItem,
});

const Flow = () => {
  const { folderId, fileId, configId } = useParams();
  const navigate = useNavigate();
  const { leftPanelActiveItem, setLeftPanelActiveItem } = useFlowStore(useShallow(selector));

  useEffect(() => {
    if (leftPanelActiveItem === "Dataset") {
      const datasetPath = `/canvas/${folderId}/${fileId}/${configId}/dataset`;
      navigate(datasetPath);
    }

    if (leftPanelActiveItem === "Evaluation") {
      const evaluationPath = `/canvas/${folderId}/${fileId}/${configId}/evaluation`;
      navigate(evaluationPath);
      setLeftPanelActiveItem(null);
    }
  }, [leftPanelActiveItem, navigate, folderId, fileId, configId, setLeftPanelActiveItem]);

  useFlowStoreCleanupByFileId();
  useFlowThumbnailUpdate();

  return (
    <CanvasDialogProvider>
      <PanelDialogProvider>
        <HotkeysProvider>
          <EditBNAHandler />
          <div className="absolute w-full">
            <CollaborativeContextProvider>
              <Canvas>
                <RealtimeFlowHandlers />
                <SubflowNodesUpdater />
                <JobSubscriber />
              </Canvas>
            </CollaborativeContextProvider>
          </div>
          <FlowResizablePanelGroup direction="horizontal" className="!h-screen">
            <LeftPanelLayout>
              <CanvasLeftPanel />
            </LeftPanelLayout>
            <CenterLayout>
              <FlowHeader className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <GenOne />
                  {/* <MoveToolsAndSearch /> */}
                  <FlowStatus />
                </div>
                <CustomFlowControls />
              </FlowHeader>
              <FlowFooter />
            </CenterLayout>
            <RightPanelLayout />
            <ShortcutsPanel />
          </FlowResizablePanelGroup>
        </HotkeysProvider>
      </PanelDialogProvider>
      <PermissionsHandler />
    </CanvasDialogProvider>
  );
};

export default Flow;
