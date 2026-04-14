import { OrchestrationModeHeader } from "./OrchestrationModeHeader";
import { SidebarHeader } from "@/components/ui/sidebar";
import { BottleneckAnalysisHeader } from "@/modules/bna";
import { useSubsetContext } from "@/modules/flow/contexts/SubsetContext";

function RightPanelAction() {
  const isSubset = useSubsetContext();

  return (
    <SidebarHeader className="border-b border-sidebar-border ">{isSubset ? <BottleneckAnalysisHeader /> : <OrchestrationModeHeader />}</SidebarHeader>
  );
}

export default RightPanelAction;
