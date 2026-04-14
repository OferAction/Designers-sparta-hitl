import { useCallback } from "react";

import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/shallow";

import { clipboardToasts, readFlowDataFromClipboard } from "../osClipboard";
import { KEYBOARD_SHORTCUTS } from "@/constants";
import { FlowStoreState, useFlowStore } from "@/store";

import { replaceSelectionWithClipboard } from "@/modules/flow/utils/clipboardActions";
import { hasProtectedNode } from "@/modules/flow/utils/hasProtectedNode";

const HOTKEY_OPTIONS = {
  preventDefault: true,
  enableOnFormTags: false,
  enableOnContentEditable: false,
};

const selector = (state: FlowStoreState) => ({
  nodes: state.nodes,
  onConnect: state.onConnect,
  setNodes: state.setNodes,
  setSelectedNodeId: state.setSelectedNodeId,
  setSelectedNodeIds: state.setSelectedNodeIds,
});

export const useReplaceWithClipboard = () => {
  const { nodes, onConnect, setNodes, setSelectedNodeId, setSelectedNodeIds } = useFlowStore(useShallow(selector));

  const handleReplace = useCallback(() => {
    const selected = nodes.filter((n) => n.selected);
    if (!selected.length) return;
    if (hasProtectedNode(selected)) return;

    readFlowDataFromClipboard().then((clip: Awaited<ReturnType<typeof readFlowDataFromClipboard>>) => {
      if (!clip || !clip.nodes?.length) {
        clipboardToasts.pasteEmpty();
        return;
      }
      replaceSelectionWithClipboard(selected, clip, nodes, onConnect, setNodes, setSelectedNodeId, setSelectedNodeIds);
      clipboardToasts.replaceSuccess(selected.length);
    });
  }, [nodes, onConnect, setNodes, setSelectedNodeId, setSelectedNodeIds]);

  useHotkeys(KEYBOARD_SHORTCUTS.REPLACE_WITH_CLIPBOARD.keys, handleReplace, HOTKEY_OPTIONS, [handleReplace]);

  return handleReplace;
};
