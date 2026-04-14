import React, { useMemo, useEffect, useRef } from "react";

import { ChartBarIcon, CommandIcon, PlugIcon, PlusCircleIcon } from "@phosphor-icons/react";
import { isMacOs } from "react-device-detect";
import { useNavigate, useParams } from "react-router-dom";
import { useShallow } from "zustand/shallow";

import { useParentFileId } from "@/hooks/useFileCache";

import { OrchestrationSettings } from "./OrchestrationSettings";
import { OrganizationSettings } from "./OrganizationSettings";
import { NodesCatalog } from "../NodesCatalog";
import { LeftPanelBranches } from "./LeftPanelBranches";
import { SystemRulesConfiguration } from "../../SystemExEx/SystemRulesConfiguration/SystemRulesConfiguration";
import { CustomRuleFunnelIcon, MonitorPulseIcon, SubflowIcon } from "@/lib/icons";
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
import { KEY_SYMBOLS } from "@/constants";
import EvaluationIndicator from "@/modules/evaluation/EvaluationIndicator/EvaluationIndicator";
import { DatasetIcon, AddDataset, DatasetIndicator } from "@/modules/flow/components/Dataset";
import { useGetFileQuery } from "@/services";
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

export function CanvasLeftPanel(props: React.ComponentProps<typeof Sidebar>) {
  const { fileId } = useParams();
  const [parentFileId] = useParentFileId(fileId || "");
  const { data: file } = useGetFileQuery(parentFileId || "");
  const { leftPanelActiveItem, setLeftPanelActiveItem, isGenOneOpen, setIsGenOneOpen } = useFlowStore(useShallow(selector));
  const navigate = useNavigate();
  const { open, setOpen } = useSidebar();

  const prevGenOneOpenRef = useRef(isGenOneOpen);
  useEffect(() => {
    if (!prevGenOneOpenRef.current && isGenOneOpen) {
      setOpen(false);
    }
    prevGenOneOpenRef.current = isGenOneOpen;
  }, [isGenOneOpen, setOpen]);

  const isParentBranchAndLive = (!fileId || !parentFileId || fileId === parentFileId) && file?.status === "Live";

  const data = useMemo(
    () => ({
      user: {
        name: "shadcn",
        email: "m@example.com",
        avatar: "/avatars/shadcn.jpg",
      },
      navMain: [
        { title: "Add", isGroupTitle: true },
        {
          title: "Nodes",
          icon: <PlusCircleIcon size={20} />,
          action: "NodeTemplates",
          disabled: isParentBranchAndLive,
          command: "1",
        },
        {
          title: "Subflow",
          icon: <SubflowIcon className="text-purple-foreground w-5 h-5" />,
          action: "SubflowTemplates",
          disabled: isParentBranchAndLive,
          command: "2",
        },
        {
          title: "Connectors",
          icon: <PlugIcon size={20} />,
          action: "ConnectorTemplates",
          disabled: isParentBranchAndLive,
          command: "3",
        },
        { title: "Separator-1", isSeparator: true },
        { title: "Set", isGroupTitle: true },
        {
          title: "Exception Rules",
          icon: <CustomRuleFunnelIcon className="size-5" />,
          action: "systemRules",
          disabled: isParentBranchAndLive,
          command: "G",
        },
        { title: "Separator-2", isSeparator: true },
        { title: "Test", isGroupTitle: true },
        {
          title: "Evaluation",
          icon: <ChartBarIcon size={20} />,
          disabled: isParentBranchAndLive,
          action: () => navigate("evaluation"),
          notificationIcon: EvaluationIndicator,
          secondIcon: <EvaluationIndicator secondIcon={true} />,
          command: "E",
        },
        {
          title: "Dataset",
          icon: <DatasetIcon />,
          action: () => navigate("dataset"),
          disabled: isParentBranchAndLive,
          command: "P",
          secondIcon: open ? <DatasetIndicator /> : null,
          after: open ? AddDataset : null,
          className: "has-[:hover]:bg-sidebar-accent",
        },
        {
          title: "Monitor",
          icon: <MonitorPulseIcon className="size-5" />,
          action: () => navigate(`/canvas/${file?.projectId}/${parentFileId}/${file?.activeConfigurationId}/monitoring`),
          command: "O",
          disabled: !!parentFileId && file?.status !== "Live",
        },
      ].filter((item) => item !== null),
    }),
    [file?.activeConfigurationId, file?.projectId, file?.status, isParentBranchAndLive, navigate, open, parentFileId]
  );

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
          <div className={cn("flex items-center justify-between w-full px-1", !open && "flex-col gap-1")}>
            <OrganizationSettings collapsed={!open} />
            <OnlineUsers className={cn("-space-x-2", !open && "flex-col gap-1 -space-y-2 space-x-0")} />
          </div>
          {open && <OrchestrationSettings />}
        </SidebarHeader>
        <Separator />
        <SidebarContent className="py-2">
          <SidebarMenu>
            {data.navMain.map((item) => {
              const active = item.action === leftPanelActiveItem;
              const isGroupTitle = item.isGroupTitle;
              const isSeparator = item.isSeparator;
              return (
                <React.Fragment key={item.title}>
                  {isGroupTitle ? (
                    <div className="py-2.5 px-3">
                      <span className="text-sm text-muted-foreground select-none">{item.title}</span>
                    </div>
                  ) : (
                    !isSeparator && (
                      <SidebarMenuItem className={cn("mx-2", item.className)}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          onClick={() => handleItemClick(item.action || "")}
                          className={cn("py-[10px] group/item", item.disabled && "opacity-60 pointer-events-none")}
                          disabled={item.disabled}
                        >
                          <div className="h-fit flex items-center gap-2 relative " data-menu-item={item.title}>
                            {!!item.notificationIcon && <item.notificationIcon />}
                            <RenderIcon icon={item.icon} className="pointer-events-none" />
                            <span className="flex-1 text-sidebar-foreground text-sm leading-5 text-ellipsis">{item.title}</span>
                          </div>
                        </SidebarMenuButton>
                        <SidebarMenuBadge className="my-1 flex items-center gap-1 ">
                          {!!item.secondIcon && <RenderIcon icon={item.secondIcon} />}
                          {!!item.command && (
                            <span
                              className={cn(
                                "text-[.6rem] leading-none font-inter text-sidebar-foreground  flex flex-row items-center",
                                !active && "text-sidebar-foreground/70"
                              )}
                            >
                              {isMacOs && <CommandIcon size={14} className="text-muted-foreground" />}
                              <span className="text-xs ml-[2px] capitalize text-muted-foreground">
                                {!isMacOs && KEY_SYMBOLS.win.cmd} {item.command}
                              </span>
                            </span>
                          )}
                        </SidebarMenuBadge>
                      </SidebarMenuItem>
                    )
                  )}
                  {isSeparator && <Separator />}
                  {item.after && <item.after />}
                </React.Fragment>
              );
            })}
          </SidebarMenu>
          <LeftPanelBranches />
        </SidebarContent>
        <SidebarFooter className="flex flex-row justify-between items-center transition-all duration-300">
          <SidebarTrigger className="self-end ml-auto" />
        </SidebarFooter>
      </Sidebar>
      <NodesCatalog />
      <SystemRulesConfiguration />
    </>
  );
}
