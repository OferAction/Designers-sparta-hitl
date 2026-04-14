import { useRef } from "react";

import VHSideMenuContent from "./VHSideMenuContent";
import VHSideMenuHeader from "./VHSideMenuHeader";
import { PanelDialog, PanelDialogProvider } from "../dialog";
import { Sidebar } from "@/components/ui/sidebar";

export default function VersionHistoryPanel({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const sidebarRef = useRef<HTMLDivElement>(null);

  return (
    <PanelDialogProvider>
      <PanelDialog />
      <Sidebar ref={sidebarRef} side="right" variant="sidebar" collapsible="icon" {...props} className="bg-sidebar static w-full right-0 duration-0">
        <div className="flex flex-col w-full h-full [&>*]:px-4 [&>*]:py-3 [&>*]:flex [&>*]:flex-col [&>*:not(:last-child)]:border-b [&>*:not(:last-child)]:border-sidebar-border">
          <VHSideMenuHeader />
          <VHSideMenuContent />
        </div>
      </Sidebar>
    </PanelDialogProvider>
  );
}
