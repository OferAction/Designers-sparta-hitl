import { useRef } from "react";

import { SidebarProvider, SidebarProviderRef } from "@/components/ui/sidebar";
import { PanelDialogProvider } from "@/modules/flow/components";
import { CanvasLeftPanel } from "@/modules/flow/components/LeftPanel";
import AnalyticsLayout from "@/modules/monitoring/analytic/AnalyticsLayout";
import LiveLayout from "@/modules/monitoring/liveMonitoring/LiveLayout";

const Monitoring = () => {
  const sidebarRef = useRef<SidebarProviderRef>(null);

  return (
    <PanelDialogProvider>
      <div className="flex pb-4">
        <div className="h-screen fixed">
          <SidebarProvider ref={sidebarRef} className="z-50 self-start" id="left-panel-provider" defaultOpen={false}>
            <CanvasLeftPanel />
          </SidebarProvider>
        </div>

        <div className="flex flex-col flex-1 [&>*]:px-4 min-w-0 ml-12">
          <AnalyticsLayout />
          <LiveLayout />
        </div>
      </div>
    </PanelDialogProvider>
  );
};

export default Monitoring;
