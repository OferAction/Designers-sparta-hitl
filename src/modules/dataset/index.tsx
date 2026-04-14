import { useLayoutEffect } from "react";

import { useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { MappingGrid } from "./components/mapping-grid";
import { Sidebar, SidebarHeader, SidebarContent } from "./components/mapping-sidebar";
import ConnectedDataset from "./components/mapping-sidebar/ConnectedDataset";
import DatasetLabels from "./components/mapping-sidebar/DatasetLabels";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGetConfiguration } from "@/services";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => ({
  setLeftPanelActiveItem: state.setLeftPanelActiveItem,
  setOrchestrationConfig: state.setOrchestrationConfig,
  setLastSaved: state.setLastSaved,
});

const Dataset = () => {
  const navigate = useNavigate();
  const { folderId = "", fileId = "", configId = "" } = useParams();
  const { setLeftPanelActiveItem, setOrchestrationConfig, setLastSaved } = useFlowStore(useShallow(selector));

  const { data, isSuccess, isError } = useGetConfiguration(configId);
  const isInitialized = useFlowStore((state) => state.isInitialized);

  const handleBackToCanvas = () => {
    setLeftPanelActiveItem(null);
    navigate(`/canvas/${folderId}/${fileId}/${configId}`);
  };

  useLayoutEffect(() => {
    if (isInitialized) return;
    if (!isSuccess && !isError) return;

    if (isSuccess && data?.config) {
      setOrchestrationConfig(data.config);
      setTimeout(() => {
        setLastSaved(data.version.timestamp);
      }, 0);
    }

    if (isError) {
      console.error("Dataset: Failed to load configuration");
    }
  }, [data, isSuccess, isError, setOrchestrationConfig, setLastSaved, isInitialized]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar */}
      <Sidebar>
        <SidebarHeader onBackClick={handleBackToCanvas} />
        <ScrollArea className="flex-1">
          <SidebarContent className="flex flex-col">
              <ConnectedDataset />
              <DatasetLabels />
          </SidebarContent>
        </ScrollArea>
      </Sidebar>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-auto">
        <MappingGrid />
      </div>
    </div>
  );
};

export default Dataset;
