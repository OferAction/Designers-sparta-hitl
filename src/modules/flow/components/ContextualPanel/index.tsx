import { useRef } from "react";

import RightPanelAction from "./RightPanelAction";
import RsideBarContent from "./RsideBarContent";
import { usePanelDialogStateContext, PanelDialog } from "../dialog";
import { Sidebar, SidebarContent } from "@/components/ui/sidebar";

const ContextualPanelContent = () => {
  const { containerRef } = usePanelDialogStateContext();
  return (
    <>
      <RightPanelAction />
      <SidebarContent ref={containerRef}>
        <RsideBarContent />
      </SidebarContent>
    </>
  );
};

export default function ContextualPanel({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <PanelDialog />
      <Sidebar ref={sidebarRef} side="right" variant="sidebar" collapsible="icon" {...props} className="bg-sidebar static w-full right-0 duration-0">
        <ContextualPanelContent />
      </Sidebar>
    </>
  );
}
