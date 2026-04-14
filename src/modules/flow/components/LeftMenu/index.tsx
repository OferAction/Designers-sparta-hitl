import { useEffect } from "react";

import { ImperativePanelHandle } from "react-resizable-panels";

import { useSidebar } from "@/components/ui/sidebar";
import { LEFT_SIDEBAR_WIDTHS } from "@/constants";

function LeftMenu({ panelRef, children }: { panelRef: React.RefObject<ImperativePanelHandle>; children: React.ReactNode }) {
  const { open } = useSidebar();
  useEffect(() => {
    if (open) {
      return panelRef.current?.resize(16.8);
    }
    panelRef.current?.resize((LEFT_SIDEBAR_WIDTHS.COLLAPSED / window.innerWidth) * 100);
  }, [open, panelRef]);
  return <>{children}</>;
}

export default LeftMenu;
