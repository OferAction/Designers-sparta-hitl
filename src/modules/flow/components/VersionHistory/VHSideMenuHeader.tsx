import { XIcon } from "@phosphor-icons/react";
import { useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import VHFilteration from "@/components/common/VHFilteration";
import { Button } from "@/components/ui/button";
import { FlowStoreState, useFlowStore } from "@/store";

const selector = (state: FlowStoreState) => ({
  setContextualMenuActiveAction: state.setContextualMenuActiveAction,
});

const VHSideMenuHeader = () => {
  const { setContextualMenuActiveAction } = useFlowStore(useShallow(selector));
  const navigate = useNavigate();
  const { folderId = "", fileId = "" } = useParams();

  const handleCloseVH = () => {
    setContextualMenuActiveAction("idle");
    navigate(`/canvas/${folderId}/${fileId}`, {
      state: {
        shouldFit: true,
      },
    });
  };

  return (
    <section className="gap-2 leading-7 ">
      <div className="flex items-center justify-between gap-3 text-sidebar-accent-foreground ">
        <h2 className="text-lg font-semibold ">Version History</h2>
        <Button variant="ghost" size="sm" onClick={handleCloseVH} className="mr-1 !border-b-0 py-[6px] px-2">
          <XIcon size={16} />
        </Button>
      </div>
      <p className="text-base leading-7 text-sidebar-foreground/70">View past versions and manage your orchestration history.</p>
      <VHFilteration />
    </section>
  );
};
export default VHSideMenuHeader;
