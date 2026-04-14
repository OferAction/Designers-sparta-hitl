import { useCallback, useMemo, useRef } from "react";

import { ImperativePanelHandle } from "react-resizable-panels";
import { useShallow } from "zustand/shallow";

import { ResizableHandle, ResizablePanel } from "@/components/ui/resizable";
import { SidebarProvider, SidebarProviderRef } from "@/components/ui/sidebar";
import { DEFAULT_SHORTCUT_SETTINGS, KEYBOARD_SHORTCUTS, LEFT_PANEL_SHORTCUTS, LEFT_SIDEBAR_WIDTHS } from "@/constants";
import LeftMenu from "@/modules/flow/components/LeftMenu";
import { useFileActions } from "@/modules/workspace";
import { FlowStoreState, useFlowStore } from "@/store";
import { FlowSidePanelState } from "@/store/slices";
import { cn } from "@/utils";

import Shortcut, { type ShortcutDefinition } from "@/utils/Shortcut";

const selector = (state: FlowStoreState) => ({
  leftPanelActiveItem: state.leftPanelActiveItem,
  setLeftPanelActiveItem: state.setLeftPanelActiveItem,
});

function LeftPanelLayout({
  children,
  className,
  hidden,
  ...props
}: React.PropsWithChildren<{ className?: string; hidden?: boolean } & React.HTMLAttributes<HTMLDivElement>>) {
  const panelRef = useRef<ImperativePanelHandle>(null);
  const sidebarRef = useRef<SidebarProviderRef>(null);
  const { leftPanelActiveItem, setLeftPanelActiveItem } = useFlowStore(useShallow(selector));
  const { addUntitledFile } = useFileActions();

  const handleAction = useCallback(
    (panelActiveItem: FlowSidePanelState["leftPanelActiveItem"]) => {
      if (!panelActiveItem) return;
      if (panelActiveItem === leftPanelActiveItem) {
        setLeftPanelActiveItem(null);
      } else {
        setLeftPanelActiveItem(panelActiveItem);
      }
    },
    [leftPanelActiveItem, setLeftPanelActiveItem]
  );

  const leftPanelShortcuts = useMemo<ShortcutDefinition[]>(
    () =>
      LEFT_PANEL_SHORTCUTS.map(({ shortcut, action }) => ({
        id: `left-panel-${action}`,
        keys: shortcut,
        handler: () => handleAction(action),
        options: { preventDefault: true },
      })),
    [handleAction]
  );

  const combinedShortcuts = useMemo<ShortcutDefinition[]>(
    () => [
      ...leftPanelShortcuts,
      {
        id: "left-panel-new-workflow",
        keys: KEYBOARD_SHORTCUTS.NEW_WORKFLOW.keys,
        handler: addUntitledFile,
        options: DEFAULT_SHORTCUT_SETTINGS,
      },
    ],
    [addUntitledFile, leftPanelShortcuts]
  );

  return (
    <>
      <Shortcut shortcuts={combinedShortcuts} />
      <ResizablePanel
        ref={panelRef}
        defaultSize={(LEFT_SIDEBAR_WIDTHS.EXPANDED / window.innerWidth) * 100}
        minSize={14}
        maxSize={(LEFT_SIDEBAR_WIDTHS.EXPANDED / window.innerWidth) * 145}
        collapsedSize={(LEFT_SIDEBAR_WIDTHS.COLLAPSED / window.innerWidth) * 100}
        className={cn(`relative !overflow-visible hidden md:block !min-w-[47.2px]`, hidden && "!hidden", className)}
        collapsible
        onCollapse={() => {
          sidebarRef.current?.setOpen?.(false);
        }}
        onExpand={() => {
          sidebarRef.current?.setOpen?.(true);
        }}
      >
        <SidebarProvider ref={sidebarRef} className="z-50 self-start w-full h-screen overflow-visible" id="left-panel-provider" {...props}>
          <LeftMenu panelRef={panelRef}>{children}</LeftMenu>
        </SidebarProvider>
      </ResizablePanel>
      <ResizableHandle
        className={cn(
          "hover:bg-primary/50 data-[resize-handle-state=drag]:bg-primary data-[resize-handle-state=hover]:bg-primary/50",
          "after:hover:bg-primary/50 after:data-[resize-handle-state=drag]:bg-primary after:data-[resize-handle-state=hover]:bg-primary/50",
          hidden && "!hidden"
        )}
      />
    </>
  );
}

export default LeftPanelLayout;
