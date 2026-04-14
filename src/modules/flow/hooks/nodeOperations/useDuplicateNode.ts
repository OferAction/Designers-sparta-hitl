import { useCallback } from "react";

import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/shallow";

import { KEYBOARD_SHORTCUTS } from "@/constants";
import { FlowStoreState, useFlowStore } from "@/store";

import { duplicateSelection } from "@/modules/flow/utils/clipboardActions";
import { hasProtectedNode } from "@/modules/flow/utils/hasProtectedNode";

const HOTKEY_OPTIONS = {
  preventDefault: true,
  enableOnFormTags: false,
  enableOnContentEditable: false,
};

const selector = (state: FlowStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onConnect: state.onConnect,
  onNodesChange: state.onNodesChange,
});

export const useDuplicateNode = () => {
  const { nodes, edges, onConnect, onNodesChange } = useFlowStore(useShallow(selector));

  const handleDuplicate = useCallback(() => {
    const selected = nodes.filter((n) => n.selected);
    if (!selected.length) return;
    if (hasProtectedNode(selected)) return;

    duplicateSelection(selected, edges, onConnect, onNodesChange);
  }, [nodes, edges, onConnect, onNodesChange]);

  useHotkeys(KEYBOARD_SHORTCUTS.DUPLICATE_NODE.keys, handleDuplicate, HOTKEY_OPTIONS, [handleDuplicate]);

  return handleDuplicate;
};
