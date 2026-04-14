import { useCallback } from "react";

import { useHotkeys } from "react-hotkeys-hook";
import { useShallow } from "zustand/shallow";

import { KEYBOARD_SHORTCUTS } from "../../../../constants/KeyboardShortcuts";
import { clipboardToasts, writeFlowDataToClipboard } from "../osClipboard";
import { FlowStoreState, useFlowStore } from "@/store";

import { buildClipboard } from "@/modules/flow/utils/clipboardActions";
import { hasProtectedNode } from "@/modules/flow/utils/hasProtectedNode";

const HOTKEY_OPTIONS = {
  preventDefault: true,
  enableOnFormTags: false,
  enableOnContentEditable: false,
};

const selector = (state: FlowStoreState) => ({
  nodes: state.nodes,
  edges: state.edges,
});

export const useCopyNode = () => {
  const { nodes, edges } = useFlowStore(useShallow(selector));

  const handleCopy = useCallback(() => {
    const selected = nodes.filter((n) => n.selected);
    if (!selected.length) return;
    // prevent copying start/end (single) or any selection containing them
    if (hasProtectedNode(selected)) return;

    const clip = buildClipboard(selected, edges);
    writeFlowDataToClipboard(clip).then((success) => {
      if (success) {
        clipboardToasts.copySuccess(selected.length);
      }
    });
  }, [nodes, edges]);

  useHotkeys(KEYBOARD_SHORTCUTS.COPY_NODE.keys,
    handleCopy,
    HOTKEY_OPTIONS,
    [nodes, edges]
  );

  return handleCopy

  
};
