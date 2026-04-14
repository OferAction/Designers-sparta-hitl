import { ReactFlowProvider } from "@xyflow/react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DatasetComponent from "@/modules/dataset";

const Dataset = () => {
  return (
    <>
      <ReactFlowProvider>
        <SidebarProvider open>
          <SidebarInset>
            <DatasetComponent />
          </SidebarInset>
        </SidebarProvider>
      </ReactFlowProvider>
    </>
  );
};

export default Dataset;
