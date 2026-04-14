import React, { useCallback, useMemo } from "react";

import { BackspaceIcon } from "@phosphor-icons/react";
import { useReactFlow } from "@xyflow/react";
import { useNavigate, useParams } from "react-router-dom";

import {
  clipboardToasts,
  useHasValidFlowDataInClipboard,
  readFlowDataFromClipboard,
  writeFlowDataToClipboard,
} from "@/modules/flow/hooks/osClipboard";

import { ChangeToNodeSubmenuContent } from "./ChangeToNodeSubmenuContent";
import {
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubTrigger,
} from "@/components/ui/context-menu";
import { mitt } from "@/lib/mitt";
import { initialConfig } from "@/modules/flow/constants";
import { useRunHandlers, useSelectedNode, useSelectedNodes, useCreateSubflow } from "@/modules/flow/hooks";
import { Node } from "@/modules/flow/types";
import { useCreateSubflowConfiguration } from "@/services";
import { FlowStoreState, useFlowStore } from "@/store";
import { useCheckCanvasPermission } from "@/store/slices";

import { buildClipboard, duplicateSelection, replaceSelectionWithClipboard } from "@/modules/flow/utils/clipboardActions";
import { hasProtectedNode } from "@/modules/flow/utils/hasProtectedNode";

// Local helper util (kept here to avoid changing existing imports elsewhere)
const withStopPropagation = (fn: () => void) => (e: React.MouseEvent) => {
  e.stopPropagation();
  fn();
};

// Generic configurable menu item types (aligned with CanvasContextMenu style)
export type NodeMenuItemConfig =
  | {
      type: "item";
      id?: string;
      label: string;
      onClick: (() => void) | ((e: React.MouseEvent) => void);
      disabled?: boolean;
      shortcut?: React.ReactNode;
      visible?: boolean;
    }
  | { type: "separator"; id?: string; visible?: boolean }
  | { type: "submenu"; id?: string; disabled?: boolean; label: string; content: React.ReactNode; visible?: boolean };

const selector = (state: FlowStoreState) => ({
  setNodes: state.setNodes,
  setSelectedNodeId: state.setSelectedNodeId,
  setSelectedNodeIds: state.setSelectedNodeIds,
  setNode: state.setNode,
  nodes: state.nodes,
  edges: state.edges,
  onConnect: state.onConnect,
  onNodesChange: state.onNodesChange,
});

interface NodeContextMenuContentProps {
  id: string;
}

export const NodeContextMenuContent: React.FC<NodeContextMenuContentProps> = ({ id }) => {
  const { setNodes, setSelectedNodeId, setSelectedNodeIds, nodes, edges, onConnect, setNode, onNodesChange } = useFlowStore(selector);

  const { deleteElements } = useReactFlow();
  const navigate = useNavigate();
  const { folderId, fileId, configId = "" } = useParams();

  const { handleRunPath } = useRunHandlers();
  const selectedNodes = useSelectedNodes();
  const selectedNode = useSelectedNode();
  const { createSubflowWithRenaming, canCreateSubflow } = useCreateSubflow();
  const { mutateAsync: createSubflowConfiguration } = useCreateSubflowConfiguration();
  const checkCanvasPermission = useCheckCanvasPermission();

  const hasClipboardData = useHasValidFlowDataInClipboard();

  // ================= Helpers =================
  const selectScope = useCallback(
    (nodeId: string) => {
      const allNodes = nodes;
      const current = allNodes.find((n) => n.id === nodeId);
      if (!current) return { selected: [] as Node[], current: undefined };
      const hasSelection = allNodes.some((n) => n.selected) && current.selected;
      return { selected: hasSelection ? allNodes.filter((n) => n.selected) : [current], current };
    },
    [nodes]
  );

  const handleCopy = useCallback(
    async (nodeId: string) => {
      const { selected: scope } = selectScope(nodeId);
      if (!scope.length) return;
      const clip = buildClipboard(scope, edges);
      const success = await writeFlowDataToClipboard(clip);
      if (success) {
        clipboardToasts.copySuccess(scope.length);
      }
    },
    [edges, selectScope]
  );

  const handleDuplicate = useCallback(
    (nodeId: string) => {
      const { selected: scope } = selectScope(nodeId);
      if (!scope.length) return;
      duplicateSelection(scope, edges, onConnect, onNodesChange);
    },
    [edges, onConnect, onNodesChange, selectScope]
  );

  const handleDelete = useCallback(
    (nodeId: string) => {
      if (selectedNodes.length > 1 && selectedNodes.some((n) => n.id === nodeId)) {
        if (selectedNodes.length) deleteElements({ nodes: selectedNodes });
      } else {
        const node = nodes.find((n) => n.id === nodeId);
        if (node) deleteElements({ nodes: [node] });
      }
    },
    [deleteElements, nodes, selectedNodes]
  );

  const pasteToReplace = useCallback(
    async (nodeId: string) => {
      const clip = await readFlowDataFromClipboard();
      if (!clip || !clip.nodes?.length) {
        clipboardToasts.pasteEmpty();
        return;
      }
      let targets = selectedNodes;
      if (!targets.length) {
        const single = nodes.find((n: Node) => n.id === nodeId);
        targets = single ? [single] : [];
      }
      if (!targets.length) return;
      const fullTargets: Node[] = targets.map((t) => nodes.find((n) => n.id === t.id)).filter((n): n is Node => !!n);
      replaceSelectionWithClipboard(fullTargets, clip, nodes, onConnect, setNodes, setSelectedNodeId, setSelectedNodeIds);
      clipboardToasts.replaceSuccess(fullTargets.length);
    },
    [nodes, onConnect, selectedNodes, setNodes, setSelectedNodeId, setSelectedNodeIds]
  );

  const handleNavigateToSubflow = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node || node.type !== "subflow") return;

      if (node.data.subflowConfigId) {
        navigate(`/canvas/${folderId}/${fileId}/${configId}/subflow/${node.data.subflowConfigId}`);
      } else {
        createSubflowConfiguration({
          $fileId: node.data.subflowId,
          frontendConfigurationSerialized: JSON.stringify(initialConfig),
        }).then((data) => {
          setNode({
            id: node.id,
            data: { ...node.data, subflowConfigId: data.id },
          });
          navigate(`/canvas/${folderId}/${fileId}/${configId}/subflow/${data.id}`);
        });
      }
    },
    [nodes, configId, navigate, folderId, fileId, createSubflowConfiguration, setNode]
  );

  const menuActions = useMemo(
    () => ({
      copy: withStopPropagation(() => handleCopy(id)),
      duplicate: withStopPropagation(() => handleDuplicate(id)),
      delete: withStopPropagation(() => handleDelete(id)),
      rename: withStopPropagation(() => {
        mitt.emit("node:double-click:focus-label", { nodeId: id });
      }),
      pasteToReplace: withStopPropagation(() => pasteToReplace(id)),
      createSubflow: withStopPropagation(() => createSubflowWithRenaming()),
      navigateToSubflow: withStopPropagation(() => handleNavigateToSubflow(id)),
      runTillHere: withStopPropagation(() => handleRunPath(id)),
    }),
    [handleCopy, id, handleDuplicate, handleDelete, pasteToReplace, createSubflowWithRenaming, handleNavigateToSubflow, handleRunPath]
  );

  const isMulti = useMemo(() => selectedNodes.length > 1, [selectedNodes]);
  const isProtectedNodeSelected = useMemo(() => hasProtectedNode(isMulti ? selectedNodes : selectedNode), [isMulti, selectedNodes, selectedNode]);

  const menuItems = useMemo<NodeMenuItemConfig[]>(
    () => [
      {
        type: "item" as const,
        id: "run-till-here",
        label: "Run till here",
        visible: !isMulti && checkCanvasPermission("canRunFlow"),
        onClick: menuActions.runTillHere,
      },
      { type: "separator" as const, id: "sep-run", visible: !isMulti && checkCanvasPermission("canRunFlow") },
      {
        type: "item" as const,
        id: "navigate-to-subflow",
        label: "Open Subflow",
        onClick: menuActions.navigateToSubflow,
        visible: !isMulti && selectedNode?.type === "subflow",
      },
      { type: "separator" as const, id: "sep-subflow-nav", visible: !isMulti && selectedNode?.type === "subflow" },
      {
        type: "item" as const,
        id: "create-subflow",
        label: "Create Subflow",
        disabled: !canCreateSubflow,
        visible: isMulti && checkCanvasPermission("canCreateElements"),
        onClick: menuActions.createSubflow,
        shortcut: (
          <ContextMenuShortcut>
            <span className="text-sm">⇧</span>S
          </ContextMenuShortcut>
        ),
      },
      { type: "separator" as const, id: "sep-subflow", visible: isMulti && checkCanvasPermission("canCreateElements") },
      {
        type: "item" as const,
        id: "copy",
        label: "Copy",
        disabled: isProtectedNodeSelected,
        onClick: menuActions.copy,
        shortcut: <ContextMenuShortcut>⌘C</ContextMenuShortcut>,
      },
      {
        type: "item" as const,
        id: "duplicate",
        label: "Duplicate",
        disabled: isProtectedNodeSelected,
        visible: checkCanvasPermission("canCreateElements"),
        onClick: menuActions.duplicate,
        shortcut: <ContextMenuShortcut>⌘D</ContextMenuShortcut>,
      },
      {
        type: "item" as const,
        id: "paste-to-replace",
        label: "Paste to replace",
        onClick: menuActions.pasteToReplace,
        disabled: isProtectedNodeSelected || !hasClipboardData,
        visible: checkCanvasPermission("canCreateElements") && checkCanvasPermission("canDragOrRemoveNodes"),
        shortcut: (
          <ContextMenuShortcut>
            <span className="text-sm">⇧</span> ⌘D
          </ContextMenuShortcut>
        ),
      },
      { type: "separator" as const, id: "sep-change" },

      {
        type: "submenu" as const,
        id: "change-to-node",
        label: "Change to node",
        disabled: isProtectedNodeSelected,
        visible:
          !isMulti &&
          checkCanvasPermission("canCreateElements") &&
          checkCanvasPermission("canDragOrRemoveNodes") &&
          selectedNode?.type !== "iterator",
        content: <ChangeToNodeSubmenuContent nodeId={id} />,
      },

      {
        type: "item" as const,
        id: "rename",
        label: "Rename node",
        disabled: isProtectedNodeSelected,
        visible: !isMulti && checkCanvasPermission("canChangeNodeData"),
        onClick: menuActions.rename,
      },
      { type: "separator" as const, id: "sep-rename", visible: !isMulti && checkCanvasPermission("canChangeNodeData") },

      {
        type: "item" as const,
        id: "delete",
        label: "Delete",
        onClick: menuActions.delete,
        disabled: isProtectedNodeSelected,
        visible: checkCanvasPermission("canDragOrRemoveNodes"),
        shortcut: (
          <ContextMenuShortcut>
            <BackspaceIcon className="text-muted-foreground" />
          </ContextMenuShortcut>
        ),
      },
    ],
    [
      isMulti,
      selectedNode?.type,
      menuActions.runTillHere,
      menuActions.navigateToSubflow,
      menuActions.createSubflow,
      menuActions.copy,
      menuActions.duplicate,
      menuActions.pasteToReplace,
      menuActions.rename,
      menuActions.delete,
      canCreateSubflow,
      isProtectedNodeSelected,
      hasClipboardData,
      id,
      checkCanvasPermission,
    ]
  );

  // Filter out items that are not visible
  const visibleMenuItems = useMemo(() => menuItems.filter((item) => item.visible !== false), [menuItems]);

  // Return null if there are no visible items
  if (visibleMenuItems.length === 0) {
    return null;
  }

  return (
    <ContextMenuContent className="rounded-md border-border w-52">
      {visibleMenuItems.map((item, index, arr) => {
        if (item.type === "separator") return index + 1 < arr.length ? <ContextMenuSeparator key={item.id} /> : null;
        if (item.type === "item") {
          return (
            <ContextMenuItem key={item.id} disabled={item.disabled} onClick={item.onClick} className="cursor-pointer">
              {item.label}
              {item.shortcut}
            </ContextMenuItem>
          );
        }
        if (item.type === "submenu") {
          return (
            <ContextMenuSub key={item.id}>
              <ContextMenuSubTrigger disabled={item.disabled} className="cursor-pointer">
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
