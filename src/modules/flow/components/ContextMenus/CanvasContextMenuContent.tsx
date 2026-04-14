import React, { useCallback, useMemo } from "react";

import { useStoreApi, useReactFlow } from "@xyflow/react";

import { useHasValidFlowDataInClipboard, readFlowDataFromClipboard, clipboardToasts } from "@/modules/flow/hooks/osClipboard";
import { useAddNode } from "@/modules/flow/hooks/useAddNode";

import AddConnectorSubmenuContent, { ConnectorItem } from "./AddConnectorSubmenuContent";
import { AddNodeSubmenuContent } from "./AddNodeSubmenuContent";
import { AddSubflowSubmenuContent } from "./AddSubflowSubmenuContent";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import { useRunHandlers } from "@/modules/flow/hooks";
import type { BaseNode } from "@/modules/flow/types";
import { File } from "@/modules/workspace";
import { useFlowStore } from "@/store";
import { useCheckCanvasPermission } from "@/store/slices";

// Generic configurable menu item types
export type CanvasMenuItemConfig =
  | { type: "item"; id?: string; label: string; onClick: () => void; disabled?: boolean; shortcut?: string; visible?: boolean }
  | { type: "separator"; id?: string; visible?: boolean }
  | { type: "submenu"; id?: string; label: string; content: React.ReactNode; visible?: boolean; disabled?: boolean };

interface CanvasContextMenuContentProps {
  contextPoint: { x: number; y: number } | null;
}

export const CanvasContextMenuContent: React.FC<CanvasContextMenuContentProps> = ({ contextPoint }) => {
  const reactFlowInstance = useStoreApi();
  const { screenToFlowPosition } = useReactFlow();
  const pasteClipboardAt = useFlowStore((s) => s.pasteClipboardAt);
  const { addNode } = useAddNode();

  const { handleRunPath } = useRunHandlers();
  const checkCanvasPermission = useCheckCanvasPermission();

  const hasClipboardData = useHasValidFlowDataInClipboard();

  const getBasePosition = useCallback(() => {
    const point = contextPoint;
    const domNode = reactFlowInstance.getState().domNode as HTMLElement | null;
    if (point) {
      return screenToFlowPosition({ x: point.x, y: point.y });
    }
    if (domNode) {
      const rect = domNode.getBoundingClientRect();
      return screenToFlowPosition({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }
    return { x: 0, y: 0 };
  }, [contextPoint, reactFlowInstance, screenToFlowPosition]);

  const handleAddNodeByTemplate = useCallback(
    (data: BaseNode["data"]) => {
      const base = getBasePosition();
      reactFlowInstance.getState().resetSelectedElements();
      const rest: object = {
        selected: true,
      };
      addNode(data.name, base, rest);
    },
    [addNode, getBasePosition, reactFlowInstance]
  );

  const handleAddSubflow = useCallback(
    (subflow: File & { flowName: string }) => {
      const base = getBasePosition();
      reactFlowInstance.getState().resetSelectedElements();
      const rest: object = {
        selected: true,
        subflowId: subflow.id,
        subflowConfigId: subflow.activeConfigurationId,
        data: {
          label: subflow.name,
        },
      };
      addNode("subflow", base, rest);
    },
    [addNode, getBasePosition, reactFlowInstance]
  );

  const handleAddConnector = useCallback(
    (connector: ConnectorItem) => {
      const base = getBasePosition();
      reactFlowInstance.getState().resetSelectedElements();
      const rest: object = {
        selected: true,
      };
      addNode(connector.data.name as BaseNode["data"]["name"], base, rest);
    },
    [addNode, getBasePosition, reactFlowInstance]
  );

  const menuItems: CanvasMenuItemConfig[] = useMemo(
    () => [
      {
        type: "item",
        id: "paste",
        label: "Paste here",
        disabled: !hasClipboardData,
        visible: checkCanvasPermission("canCreateElements"),
        onClick: async () => {
          const base = getBasePosition();
          await pasteClipboardAt(base);
          const clip = await readFlowDataFromClipboard();
          if (clip?.nodes?.length) {
            clipboardToasts.pasteSuccess(clip.nodes.length);
          }
        },
      },
      { type: "separator", id: "sep-1", visible: checkCanvasPermission("canCreateElements") },
      {
        type: "submenu",
        id: "add-node",
        label: "Add Node",
        visible: checkCanvasPermission("canCreateElements"),
        content: <AddNodeSubmenuContent onAdd={handleAddNodeByTemplate} />,
      },
      {
        type: "submenu",
        id: "add-subflow",
        label: "Add Subflow",
        visible: checkCanvasPermission("canCreateElements"),
        content: <AddSubflowSubmenuContent onAdd={handleAddSubflow} />,
      },
      {
        type: "submenu",
        id: "add-connector",
        label: "Add Connector",
        visible: checkCanvasPermission("canCreateElements"),
        content: <AddConnectorSubmenuContent onAdd={handleAddConnector} />,
      },
      {
        type: "item",
        id: "run",
        label: "Run",
        shortcut: "⌘R",
        visible: checkCanvasPermission("canRunFlow"),
        onClick: handleRunPath,
      },
    ],
    [
      hasClipboardData,
      checkCanvasPermission,
      handleAddNodeByTemplate,
      handleAddSubflow,
      handleAddConnector,
      handleRunPath,
      getBasePosition,
      pasteClipboardAt,
    ]
  );

  // Filter out items that are not visible
  const visibleMenuItems = useMemo(() => menuItems.filter((item) => item.visible !== false), [menuItems]);

  if (visibleMenuItems.length === 0) {
    return null;
  }

  return (
    <ContextMenuContent avoidCollisions={false} className="w-48">
      {visibleMenuItems.map((item) => {
        if (item.type === "separator") return <ContextMenuSeparator key={item.id || Math.random()} />;
        if (item.type === "item") {
          return (
            <ContextMenuItem key={item.id || item.label} disabled={item.disabled} onClick={item.onClick} className="cursor-pointer">
              {item.label}
              {item.shortcut && <ContextMenuShortcut>{item.shortcut}</ContextMenuShortcut>}
            </ContextMenuItem>
          );
        }
        if (item.type === "submenu") {
          return (
            <ContextMenuSub key={item.id || item.label}>
              <ContextMenuSubTrigger className="cursor-pointer" disabled={item.disabled}>
                {item.label}
              </ContextMenuSubTrigger>
              {item.content}
            </ContextMenuSub>
          );
        }
        return null;
      })}
    </ContextMenuContent>
  );
};
