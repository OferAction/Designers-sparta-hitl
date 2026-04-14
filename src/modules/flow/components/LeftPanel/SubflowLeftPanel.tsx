import React from "react";

import { PlugIcon, PlusCircleIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/shallow";

import { NodesCatalog } from "../NodesCatalog";
import { OrchestrationSettings } from "./OrchestrationSettings";
import { OrganizationSettings } from "./OrganizationSettings";
import { SubflowIcon } from "@/lib/icons";
import { OnlineUsers } from "@/components/common/OnlineUsers";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarMenuBadge,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { FlowStoreState, useFlowStore } from "@/store";
import { cn } from "@/utils";

const selector = (state: FlowStoreState) => ({
  leftPanelActiveItem: state.leftPanelActiveItem,
  setLeftPanelActiveItem: state.setLeftPanelActiveItem,
  contextualMenuActiveAction: state.contextualMenuActiveAction,
  isGenOneOpen: state.isGenOneOpen,
  setIsGenOneOpen: state.setIsGenOneOpen,
});
const RenderIcon = ({ icon, className = "" }: { icon: React.ReactNode; className?: string }) => (
  <div className={cn("flex items-center justify-center", className)}>{icon}</div>
);

export function SubflowLeftPanel(props: React.ComponentProps<typeof Sidebar>) {
  const { leftPanelActiveItem, setLeftPanelActiveItem, isGenOneOpen, setIsGenOneOpen } = useFlowStore(useShallow(selector));
  const { open } = useSidebar();

  const navMain = [
    { title: "Add", isGroupTitle: true },
    {
      title: "Nodes",
      icon: <PlusCircleIcon size={20} />,
      action: "NodeTemplates",
      command: "1",
    },
    {
      title: "Subflow",
      icon: <SubflowIcon className="text-purple-foreground w-5 h-5" />,
      action: "SubflowTemplates",
      command: "2",
    },
    {
      title: "Connectors",
      icon: <PlugIcon size={20} />,
      action: "ConnectorTemplates",
      command: "3",
    },
    { isSeparator: false },
    // {
    //   title: "Live Data",
    //   icon: <HardDrivesIcon size={20} />,
    //   action: "Live_Data",
    //   secondIcon: <PlusIcon size={16} />,
    // },
  ];

  const handleItemClick = (action: string | (() => void)) => {
    if (typeof action === "function") {
      action();
    } else if (action === leftPanelActiveItem) {
      setLeftPanelActiveItem(null);
    } else {
      setLeftPanelActiveItem(action);
    }
    if (isGenOneOpen) {
      setIsGenOneOpen(false);
    }
  };

  return (
    <>
      <Sidebar className="duration-0 relative w-full overflow-visible" collapsible="icon" id="left-panel" variant="sidebar" {...props}>
        <SidebarHeader className="p-2 gap-0">
          <div className="flex items-center justify-between">
            <OrganizationSettings collapsed={!open} />
            {open && <OnlineUsers className="-space-x-2" />}
          </div>
          {open && <OrchestrationSettings />}
        </SidebarHeader>
        <Separator />
        <SidebarContent className="py-2">
          <SidebarMenu>
            {navMain.map((item) => {
              const active = item.action === leftPanelActiveItem;
              const isSeparator = item.isSeparator;
              return (
                <React.Fragment key={item.title}>
                  {item.isGroupTitle ? (
                    <div className="py-2.5 px-3">
                      <span className="text-sm text-muted-foreground select-none">{item.title}</span>
                    </div>
                  ) : (
                    !isSeparator && (
                      <SidebarMenuItem className={cn("w-full")}>
                        <SidebarMenuButton asChild isActive={active} onClick={() => handleItemClick(item.action || "")} className="py-[10px]">
                          <div className="h-fit flex items-center gap-2" data-menu-item={item.title}>
                            <RenderIcon icon={item.icon} className="pointer-events-none" />
                            <span className="flex-1 text-sidebar-foreground text-sm leading-5 text-ellipsis">{item.title}</span>
                          </div>
                        </SidebarMenuButton>
                        <SidebarMenuBadge className="my-1 flex items-center gap-1">
                          {/* {!!item.secondIcon && <RenderIcon icon={item.secondIcon} />} */}
                          {!!item.command && (
                            <p className={cn("text-[.6rem] leading-none font-mono text-sidebar-foreground", !active && "text-sidebar-foreground/70")}>
                              ⌘<span className="text-xs ml-[2px] capitalize">{item.command}</span>
                            </p>
                          )}
                        </SidebarMenuBadge>
                      </SidebarMenuItem>
                    )
                  )}
                  {isSeparator && <Separator />}
                </React.Fragment>
              );
            })}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="flex flex-row justify-between items-center transition-all duration-300">
          <SidebarTrigger className="self-end ml-auto" />
        </SidebarFooter>
      </Sidebar>
      <NodesCatalog />
    </>
  );
}
