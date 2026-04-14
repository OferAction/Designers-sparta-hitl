import { useCallback } from "react";

import { useHotkeys } from "react-hotkeys-hook";

import { useRunHandlers } from "@/modules/flow/hooks/useRunHandlers";

import { KEYBOARD_SHORTCUTS } from "@/constants";

const HOTKEY_OPTIONS = {
  preventDefault: true,
  enableOnFormTags: false,
  enableOnContentEditable: false,
};

export const useRunPathHotkey = () => {
  const { handleRunPath } = useRunHandlers();

  const runPathShortcut = useCallback(() => {
    handleRunPath();
  }, [handleRunPath]);

  useHotkeys(KEYBOARD_SHORTCUTS.RUN_PATH.keys, runPathShortcut, HOTKEY_OPTIONS, [runPathShortcut]);

  return runPathShortcut;
};
