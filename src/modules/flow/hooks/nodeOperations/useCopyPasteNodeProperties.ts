import { useCallback, useRef } from "react";

import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/shallow";

import { clipboardToasts } from "../osClipboard";
import { KEYBOARD_SHORTCUTS } from "@/constants";
import type { Node } from "@/modules/flow/types";
import { FlowStoreState, useFlowStore } from "@/store";
import { useCheckCanvasPermission } from "@/store/slices/flowSlice";

const HOTKEY_OPTIONS = {
  preventDefault: true,
  enableOnFormTags: false,
  enableOnContentEditable: false,
};

type CopiedNodeProperties = {
  readonly type: string;
  readonly name: string;
  readonly data: Record<string, unknown>;
} | null;

const selector = (state: FlowStoreState) => ({
  nodes: state.nodes,
  selectedNodeId: state.selectedNodeId,
  setNode: state.setNode,
});

export const useCopyPasteNodeProperties = () => {
  const { nodes, selectedNodeId, setNode } = useFlowStore(useShallow(selector));
  const checkCanvasPermission = useCheckCanvasPermission();
  const copiedNodePropertiesRef = useRef<CopiedNodeProperties>(null);

  const handleCopy = useCallback(() => {
    if (!selectedNodeId) return;

    const sourceNode = nodes.find((node) => node.id === selectedNodeId);
    if (!sourceNode) return;

    const { sourceHandleConnected: _sourceHandleConnected, targetHandleConnected: _targetHandleConnected, ...dataToPersist } = sourceNode.data;

    copiedNodePropertiesRef.current = {
      type: sourceNode.type as string,
      name: sourceNode.data.name as string,
      data: JSON.parse(JSON.stringify(dataToPersist)),
    };

    clipboardToasts.copyPropertiesSuccess();
  }, [nodes, selectedNodeId]);

  const handlePaste = useCallback(() => {
    if (!checkCanvasPermission("canChangeNodeData")) return;
    if (!selectedNodeId || !copiedNodePropertiesRef.current) return;

    const targetNode = nodes.find((node) => node.id === selectedNodeId);
    if (!targetNode) return;

    const { type, name, data } = copiedNodePropertiesRef.current;

    if (targetNode.type !== type || targetNode.data.name !== name) {
      clipboardToasts.pastePropertiesTypeMismatch();
      return;
    }

    const updatedData = {
      ...data,
      sourceHandleConnected: targetNode.data.sourceHandleConnected,
      targetHandleConnected: targetNode.data.targetHandleConnected,
      label: targetNode.data.label,
      outputs: targetNode.data.outputs,
    };

    setNode({
      id: targetNode.id,
      data: updatedData,
    } as Partial<Node> & Pick<Node, "id">);

    clipboardToasts.pastePropertiesSuccess();
  }, [checkCanvasPermission, nodes, selectedNodeId, setNode]);

  useHotkeys(KEYBOARD_SHORTCUTS.COPY_NODE_PROPERTIES.keys, handleCopy, HOTKEY_OPTIONS, [handleCopy]);
  useHotkeys(KEYBOARD_SHORTCUTS.PASTE_NODE_PROPERTIES.keys, handlePaste, { ...HOTKEY_OPTIONS }, [handlePaste]);

  return { handleCopy, handlePaste };
};
