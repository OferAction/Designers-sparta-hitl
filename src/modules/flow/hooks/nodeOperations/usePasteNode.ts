import { useCallback } from "react";

import { useHotkeys } from "react-hotkeys-hook";

import { clipboardToasts, readFlowDataFromClipboard } from "../osClipboard";
import { KEYBOARD_SHORTCUTS } from "@/constants";
import { useFlowStore } from "@/store";

const HOTKEY_OPTIONS = {
  preventDefault: true,
  enableOnFormTags: false,
  enableOnContentEditable: false,
};

interface UsePasteNodeProps {
  computePasteBase: () => { x: number; y: number };
}

export const usePasteNode = ({ computePasteBase }: UsePasteNodeProps) => {
  const handlePaste = useCallback(() => {
    readFlowDataFromClipboard().then((clip) => {
      if (!clip?.nodes?.length) {
        clipboardToasts.pasteEmpty();
        return;
      }
      const base = computePasteBase();
      useFlowStore
        .getState()
        .pasteClipboardAt(base)
        .then(() => {
          clipboardToasts.pasteSuccess(clip.nodes.length);
        });
    });
  }, [computePasteBase]);
  useHotkeys(KEYBOARD_SHORTCUTS.PASTE_NODE.keys, handlePaste, HOTKEY_OPTIONS, [handlePaste]);

  return usePasteNode;
};
