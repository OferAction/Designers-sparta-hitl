import React, { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import {
  Background,
  BackgroundVariant,
  type EdgeTypes,
  type NodeTypes,
  ReactFlow,
  type NodeMouseHandler,
  type OnBeforeDelete,
  useReactFlow,
  useStoreApi,
  ReactFlowProps,
} from "@xyflow/react";
import { useShallow } from "zustand/shallow";

import useNodeShortcuts from "@/modules/flow/hooks/useNodeShortcuts";
import { useProximityConnect } from "@/modules/flow/hooks/useProximityConnect";
import { useSelectNextNode } from "@/modules/flow/hooks/useSelectNextNode";
import { useSelectPreviousNode } from "@/modules/flow/hooks/useSelectPreviousNode";
import { MIN_ZOOM, MAX_ZOOM } from "@/modules/flow/hooks/ZoomControls/constants";

import { CanvasContextMenu } from "./ContextMenus";
import { CurvedEdge, StraightEdge, TempEdgeGradient } from "./Edges";
import { StartNode, EndNode, AgentNode, ConditionalOperatorNode, IterationNode, SubflowNode } from "./GeneralNodes";
import LiveCursor from "./LiveCursor";
import { useConnectionValidity } from "../utils/useConnectionValidity";
import ConnectionLine from "@/modules/flow/components/ConnectionLine";
import { CanvasDialog, useCanvasDialogStateContext } from "@/modules/flow/components/dialog";
import { useDropHandler } from "@/modules/flow/hooks";
import hocusPocusServiceSingleton from "@/services/hocusPocus/collaborativeService";
import { useFlowStore, type FlowStoreState } from "@/store";
import { useCheckCanvasPermission } from "@/store/slices/flowSlice";

import { hasProtectedNode } from "@/modules/flow/utils/hasProtectedNode";
import Shortcut, { type ShortcutDefinition } from "@/utils/Shortcut";

import { KEYBOARD_SHORTCUTS } from "@/constants/KeyboardShortcuts";

import type { Edge, Node } from "../types";

interface CanvasProps extends Partial<ReactFlowProps<Node, Edge>> {
  children?: ReactNode;
}

const nodeTypes: NodeTypes = {
  start: StartNode,
  agent: AgentNode,
  ifelse: ConditionalOperatorNode,
  iterator: IterationNode,
  end: EndNode,
  aggregator: AgentNode,
  identity: AgentNode,
  dataLoader: AgentNode,
  subflow: SubflowNode,
  connector: AgentNode,
};

const edgeTypes: EdgeTypes = {
  curved: CurvedEdge,
  straight: StraightEdge,
};

const defaultEdgeOptions = {
  animated: false,
  type: "curved",
};

const selector = (state: FlowStoreState) => ({
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  nodes: state.nodes,
  edges: state.edges,
  onDelete: state.onDelete,
  leftPanelActiveItem: state.leftPanelActiveItem,
  setLeftPanelActiveItem: state.setLeftPanelActiveItem,
  selectedNodeIds: state.selectedNodeIds,
});

export const Canvas: React.FC<CanvasProps> = ({ children, ...rest }) => {
  const [isShift, setIsShift] = useState(false);
  const { isValidConnection } = useConnectionValidity();
  const { handleProximityDrag, handleProximityDragStop } = useProximityConnect();
  const { onNodesChange, onEdgesChange, onConnect, onDelete, nodes, edges, leftPanelActiveItem, setLeftPanelActiveItem, selectedNodeIds } =
    useFlowStore(useShallow(selector));

  const checkCanvasPermission = useCheckCanvasPermission();
  const selectNextNode = useSelectNextNode();
  const selectPreviousNode = useSelectPreviousNode();

  const reactFlowInstance = useStoreApi();

  const { onDragOver, onDrop, onDragEnter, onDragLeave } = useDropHandler();
  const { containerRef } = useCanvasDialogStateContext();
  const { screenToFlowPosition } = useReactFlow();

  // Add handler for pane click to close NodesCatalog
  const handlePaneClick = useCallback(() => {
    if (
      leftPanelActiveItem === "NodeTemplates" ||
      leftPanelActiveItem === "SubflowTemplates" ||
      leftPanelActiveItem === "ConnectorTemplates" ||
      leftPanelActiveItem === "systemRules"
    ) {
      setLeftPanelActiveItem("none");
    }
  }, [leftPanelActiveItem, setLeftPanelActiveItem]);

  // Ensure node becomes part of current selection on context menu (additive)
  const handleNodeContextMenu: NodeMouseHandler<Node> = useCallback(
    (event, node) => {
      if (selectedNodeIds.length > 1) return;
      event.preventDefault();
      reactFlowInstance.getState().resetSelectedElements();

      onNodesChange([
        {
          id: node.id,
          type: "select",
          selected: true,
        },
      ]);
    },
    [selectedNodeIds.length, reactFlowInstance, onNodesChange]
  );

  const handleSelectionContextMenu = useCallback(
    (event: React.MouseEvent, selectedNodes: Node[]) => {
      event.preventDefault();

      if (selectedNodes.length <= 1) return;
      reactFlowInstance.getState().resetSelectedElements();

      onNodesChange(
        selectedNodes.map((n) => ({
          id: n.id,
          type: "select",
          selected: true,
        }))
      );
    },
    [onNodesChange, reactFlowInstance]
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShift(true);
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsShift(false);
    };
    const onBlur = () => setIsShift(false);
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("blur", onBlur);
    };
  }, []);

  const onBeforeDelete: OnBeforeDelete<Node, Edge> = useCallback(({ nodes: nodesToDelete }) => {
    const deleteDisabled = hasProtectedNode(nodesToDelete);
    return Promise.resolve(!deleteDisabled);
  }, []);

  // Handle cursor position during node dragging
  const handleMouseActions = useCallback(
    (event: React.MouseEvent) => {
      hocusPocusServiceSingleton?.handleMouseActions(event, screenToFlowPosition);
    },
    [screenToFlowPosition]
  );

  const handleSelectAll = useCallback(() => {
    reactFlowInstance.getState().resetSelectedElements();
    onNodesChange(nodes.map((n) => ({ id: n.id, type: "select", selected: true })));
  }, [nodes, onNodesChange, reactFlowInstance]);

  const canvasShortcuts = useMemo<ShortcutDefinition[]>(
    () => [
      {
        id: "canvas-select-all",
        keys: KEYBOARD_SHORTCUTS.SELECT_ALL.keys,
        handler: handleSelectAll,
        options: { permissionKey: "canSelectNodes", enableOnFormTags: false },
      },
      {
        id: "canvas-select-next",
        keys: KEYBOARD_SHORTCUTS.SELECT_NEXT_NODE.keys,
        handler: selectNextNode,
        options: { enableOnFormTags: false },
      },
      {
        id: "canvas-select-prev",
        keys: KEYBOARD_SHORTCUTS.SELECT_PREVIOUS_NODE.keys,
        handler: selectPreviousNode,
        options: { enableOnFormTags: false },
      },
    ],
    [handleSelectAll, selectNextNode, selectPreviousNode]
  );
  useNodeShortcuts();

  // Combined node drag handler with proximity connect
  const handleNodeDrag = useCallback(
    (event: React.MouseEvent, node: Node) => {
      handleMouseActions(event);
      handleProximityDrag(event, node);
    },
    [handleMouseActions, handleProximityDrag]
  );

  // Combined node drag stop handler with proximity connect
  const handleNodeDragStop = useCallback(
    (event: React.MouseEvent, node: Node) => {
      handleMouseActions(event);
      handleProximityDragStop(event, node);
    },
    [handleMouseActions, handleProximityDragStop]
  );

  return (
    <div className="h-screen flex flex-1 shrink-0">
      <Shortcut shortcuts={canvasShortcuts} />
      <div className={`flex-grow flow-wrapper ${isShift ? "is-shift" : ""}`}>
        <CanvasContextMenu>
          <ReactFlow
            id="react-flow-canvas"
            tabIndex={-1}
            nodes={nodes}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onSelectionContextMenu={handleSelectionContextMenu}
            onNodeContextMenu={handleNodeContextMenu}
            onNodeDrag={handleNodeDrag}
            onNodeDragStart={handleMouseActions}
            onNodeDragStop={handleNodeDragStop}
            onConnect={onConnect}
            onDragEnter={onDragEnter}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onPaneClick={handlePaneClick} // Add onPaneClick handler
            connectionLineComponent={ConnectionLine}
            defaultEdgeOptions={defaultEdgeOptions}
            isValidConnection={isValidConnection}
            snapToGrid={true}
            snapGrid={[15, 15]}
            nodeOrigin={[0.5, 0.5]}
            panOnScroll
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            zoomOnScroll={false} // disable built-in zoom
            onDelete={onDelete}
            deleteKeyCode={["Delete", "Backspace"]}
            onBeforeDelete={onBeforeDelete}
            elevateNodesOnSelect={false}
            elevateEdgesOnSelect={false}
            ref={containerRef}
            className=""
            onMouseMove={handleMouseActions}
            nodesDraggable={checkCanvasPermission("canDragOrRemoveNodes")}
            elementsSelectable={checkCanvasPermission("canSelectNodes") || checkCanvasPermission("canSelectEdges")}
            selectionOnDrag={checkCanvasPermission("canSelectNodes")}
            selectNodesOnDrag={checkCanvasPermission("canSelectNodes")}
            nodesConnectable={checkCanvasPermission("canCreateElements")}
            {...rest}
          >
            <Background gap={32} size={2} className="bg-background" variant={BackgroundVariant.Dots} color="rgba(248, 250, 252, 0.2)" />
            <CanvasDialog />
            {children}
            <TempEdgeGradient />
            <LiveCursor />
          </ReactFlow>
        </CanvasContextMenu>
      </div>
    </div>
  );
};
